import axios from "axios";

import { useAppStore } from "@/stores/appStore";

import { apiBaseURL, useMock } from "./config";

export const USE_MOCK = useMock;
let pendingRequests = 0;

const apiRequest = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiRequest.interceptors.request.use(
  (config) => {
    pendingRequests += 1;
    useAppStore().setLoading(true);

    const token = localStorage.getItem("mspwm.accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
    return response.data;
  },
  (error) => {
    settleRequest();

    const status = error?.response?.status;
    const errorMessage = getErrorMessage(error);

    // refresh token flow 尚未由後端規格確認，先只做安全導頁。
    if (status === 401) {
      localStorage.removeItem("mspwm.auth");
      localStorage.removeItem("mspwm.accessToken");
      window.location.href = "/login";
    }

    if (status === 403) {
      window.location.href = "/403";
    }

    useAppStore().showAlert({
      title: error?.response?.data?.code || "錯誤",
      message: errorMessage,
    });

    return Promise.reject(error);
  },
);

function settleRequest() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) useAppStore().setLoading(false);
}

function getErrorMessage(error) {
  if (!window.navigator.onLine) return "網路連線中斷，請檢查您的網路連線";
  if (error?.message?.includes("timeout")) return "連線超時，請稍後再試";

  const responseData = error?.response?.data;
  if (responseData?.desc) return responseData.desc;
  if (responseData?.message) return responseData.message;

  switch (error?.response?.status) {
    case 400:
      return "400：錯誤的請求";
    case 401:
      return "401：未授權的請求";
    case 403:
      return "403：禁止訪問";
    case 404:
      return "404：找不到頁面";
    case 500:
      return "500：伺服器內部錯誤";
    case 502:
      return "502：無效的伺服器回應";
    case 504:
      return "504：伺服器回應超時";
    default:
      return error?.message || "未知錯誤";
  }
}

export default apiRequest;
