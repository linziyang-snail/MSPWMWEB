export const mockLoginResponses = {
  "1193285": {
    accessToken: "mock-editor-token",
    userId: "1193285",
    employeeId: "1193285",
    userName: "經辦",
    roles: ["EDITOR"],
    mustChangePassword: false,
    passwordResetByAdmin: false,
    passwordChangedAt: new Date().toISOString(),
  },
  "2293285": {
    accessToken: "mock-reviewer-token",
    userId: "2293285",
    employeeId: "2293285",
    userName: "覆核主管",
    roles: ["REVIEWER"],
    mustChangePassword: false,
    passwordResetByAdmin: false,
    passwordChangedAt: new Date().toISOString(),
  },
  "9993285": {
    accessToken: "mock-admin-token",
    userId: "9993285",
    employeeId: "9993285",
    userName: "超級管理員",
    roles: ["ADMIN"],
    mustChangePassword: false,
    passwordResetByAdmin: false,
    passwordChangedAt: new Date().toISOString(),
  },
};

export const mockLoginResponse = mockLoginResponses["1193285"];
