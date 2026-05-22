import { mockNoResponse } from "./common";

export const mockGetOrganizationCategories = async (orgId) => ({
  orgId,
  categoryIds: [],
});

export const mockAssignOrganizationCategories = async () => mockNoResponse();

export const mockAddOrganizationCategory = async () => mockNoResponse();

export const mockRemoveOrganizationCategory = async () => mockNoResponse();
