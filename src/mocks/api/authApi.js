import { mockLoginResponse, mockLoginResponses } from "@/mocks/auth.mock";

export const mockLogin = async (userId, password) => {
  const matchedAccount = mockLoginResponses[userId] || mockLoginResponse;
  return {
    ...matchedAccount,
    userId: userId || matchedAccount.userId,
    password,
  };
};

export const mockLogout = async () => ({});

export const mockRefreshToken = async () => ({
  accessToken: "mock-refreshed-token",
});
