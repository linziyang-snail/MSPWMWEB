import { mockCopyCategories } from "@/mocks/copies.mock";

import { mockNoResponse } from "./common";

export const mockGetCopyCategoriesByDepartmentId = async (departmentId) =>
  mockCopyCategories.filter(
    (category) => Number(category.departmentId) === Number(departmentId),
  );

export const mockGetCompatibleCopyCategories = async () => mockCopyCategories;

export const mockCreateCopyCategory = async () => mockNoResponse();

export const mockUpdateCopyCategory = async () => mockNoResponse();

export const mockDisableCopyCategory = async () => mockNoResponse();
