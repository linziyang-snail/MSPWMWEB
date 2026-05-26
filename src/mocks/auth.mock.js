export const mockLoginResponses = {
  admin01: {
    accessToken: "mock-admin01-token",
    userId: "admin01",
    employeeId: "admin01",
    userName: "系統管理員",
    roles: ["ADMIN"],
    mustChangePassword: false,
    passwordResetByAdmin: false,
    passwordChangedAt: new Date().toISOString(),
  },
  admin02: {
    accessToken: "mock-admin02-token",
    userId: "admin02",
    employeeId: "admin02",
    userName: "系統管理員",
    roles: ["ADMIN"],
    mustChangePassword: false,
    passwordResetByAdmin: false,
    passwordChangedAt: new Date().toISOString(),
  },
  manager: {
    accessToken: "mock-manager-token",
    userId: "manager",
    employeeId: "manager",
    userName: "覆核主管",
    roles: ["MANAGER"],
    mustChangePassword: false,
    passwordResetByAdmin: false,
    passwordChangedAt: new Date().toISOString(),
  },
  user001: {
    accessToken: "mock-user001-token",
    userId: "user001",
    employeeId: "user001",
    userName: "一般使用者",
    roles: ["USER"],
    mustChangePassword: false,
    passwordResetByAdmin: false,
    passwordChangedAt: new Date().toISOString(),
  },
};

export const mockLoginResponse = mockLoginResponses.user001;
