import apiRequest from "./apiRequest";

export async function login(payload) {
  const { userId, password } = payload || {};
  return apiRequest.post(
    "/auth/login",
    { userId, password },
    { skipAuth: true, skipGlobalErrorCodes: ["1007", "1008"] },
  );
}

export async function logout() {
  return apiRequest.post("/auth/logout", {});
}

export async function changeMyPassword(payload) {
  const { id, oldPassword, newPassword } = payload || {};
  const body = { id, oldPassword, newPassword };
  return apiRequest.put("/auth/me/password", body);
}
