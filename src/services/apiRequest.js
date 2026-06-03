import axios from "axios";

import { useAppStore } from "@/stores/appStore";
import { clearAuthStorage, readAccessToken } from "@/utils/authStorage";
import { resolveApiErrorMessage } from "@/utils/resolveApiErrorMessage";

import { apiBaseURL } from "./config";

let pendingRequests = 0;

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
  (error) => {
    settleRequest();
    const apiError = normalizeApiError(error);
    handleApiError(apiError, error?.config);
    return Promise.reject(apiError);
  },
);

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
