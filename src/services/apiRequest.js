import axios from "axios";

import { useAppStore } from "@/stores/appStore";
import {
  clearAuthStorage,
  readAccessToken,
  writeAccessToken,
} from "@/utils/authStorage";
import { resolveApiErrorMessage } from "@/utils/resolveApiErrorMessage";

import { apiBaseURL } from "./config";

let pendingRequests = 0;
let refreshPromise = null;

const apiRequest = axios.create({
  baseURL: apiBaseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    serialize: serializeParams,
  },
});

apiRequest.interceptors.request.use(
  (config) => {
    pendingRequests += 1;
    useAppStore().setLoading(true);

    const token = readAccessToken();
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    settleRequest();
    return Promise.reject(error);
  },
);

apiRequest.interceptors.response.use(
  (response) => {
    settleRequest();
    if (response.config?.responseType === "blob") return response;
    const apiError = normalizeBusinessError(response);
    if (apiError) {
      handleApiError(apiError, response.config);
      return Promise.reject(apiError);
    }
    return response.data;
  },
  async (error) => {
    settleRequest();
    const apiError = normalizeApiError(error);
    const config = error?.config || {};
    // On 401, exchange the expired access token for a fresh one via the
    // httpOnly refresh_token cookie, then replay the original request once
    // (sliding session). Only log out if the refresh itself fails.
    if (apiError.status === 401 && !config.__retriedAuth && readAccessToken()) {
      try {
        await requestRefresh();
        config.__retriedAuth = true;
        return apiRequest(config);
      } catch {
        // refresh failed (e.g. refresh_token cookie expired) — fall through
        // to the normal 401 handling (logout)
      }
    }
    handleApiError(apiError, config);
    return Promise.reject(apiError);
  },
);

// POST /auth/refresh: the browser sends the httpOnly refresh_token cookie
// (withCredentials), the backend returns a new access token in body.token.
// A bare axios call bypasses these interceptors (no recursion, no global error
// handling); concurrent 401s share a single refresh.
function requestRefresh() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${apiBaseURL}/auth/refresh`,
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 60000,
        },
      )
      .then((response) => {
        const data = response?.data ?? {};
        if (data.code && data.code !== "0000") {
          throw new Error("Token refresh rejected");
        }
        const nextToken = data.body?.token || data.body?.accessToken || "";
        if (!nextToken) throw new Error("Token refresh returned no token");
        writeAccessToken(nextToken);
        return nextToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function settleRequest() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) useAppStore().setLoading(false);
}

function normalizeApiError(error) {
  const data = error?.response?.data;
  return {
    status: error?.response?.status,
    code: data?.code || data?.returnCode,
    desc: data?.desc || data?.returnMsg || data?.message || error?.message,
    body: data?.body,
    raw: error,
  };
}

function normalizeBusinessError(response) {
  const data = response?.data;
  if (!data || typeof data !== "object") return null;
  if (!("code" in data) || data.code === "0000") return null;
  return {
    status: response?.status,
    code: data.code,
    desc: data.desc,
    body: data.body,
    raw: response,
  };
}

function handleApiError(apiError, config = {}) {
  if (apiError.status === 401) {
    clearAuthStorage();
    redirectToLogin();
  }

  const skippedCodes = Array.isArray(config?.skipGlobalErrorCodes)
    ? config.skipGlobalErrorCodes.map((code) => String(code))
    : [];
  if (!config?.skipGlobalErrorHandler && !skippedCodes.includes(String(apiError.code))) {
    useAppStore().showAlert({
      title: apiError.code || "系統提示",
      message: resolveApiErrorMessage(apiError),
    });
  }
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  const currentPath = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?redirect=${encodeURIComponent(currentPath)}`);
}

export default apiRequest;

export function unwrapApiBody(response) {
  if (response && typeof response === "object" && "body" in response) {
    return response.body;
  }
  return response;
}

function serializeParams(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value
        .filter((item) => item !== undefined && item !== null && item !== "")
        .forEach((item) => searchParams.append(key, item));
      return;
    }
    searchParams.append(key, value);
  });
  return searchParams.toString();
}
