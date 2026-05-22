import {
  mockAccountChangeRequests,
  mockUsers,
} from "@/mocks/users.mock";

import { createPage, mockNoResponse } from "./common";

export const mockGetUsers = async (page = 1, size = 20) =>
  createPage(mockUsers, page, size);

export const mockGetUserById = async (id) =>
  mockUsers.find((user) => String(user.id) === String(id)) || null;

export const mockCreateUser = async () => mockNoResponse();

export const mockUpdateUser = async () => mockNoResponse();

export const mockDeleteUser = async () => mockNoResponse();

export const mockUnlockUser = async () => mockNoResponse();

export const mockResetUserPassword = async () => mockNoResponse();

export const mockChangeMyPassword = async () => mockNoResponse();

export const mockGetAccountChangeRequests = async () => mockAccountChangeRequests;
