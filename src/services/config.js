export const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const useMock = import.meta.env.VITE_USE_MOCK === "true";
