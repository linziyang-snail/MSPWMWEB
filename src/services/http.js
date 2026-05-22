import apiRequest, { USE_MOCK } from "./apiRequest";

// Legacy compatibility: new code should import apiRequest directly.
export const http = apiRequest;
export { USE_MOCK };
