import { mockNoResponse } from "./common";

const mockOrganizationCategories = [
  { orgId: 2, categoryIds: [1, 2, 3] },
  { orgId: 3, categoryIds: [2, 3] },
];

export const mockGetOrganizationCategories = async (orgId) => ({
  orgId,
  categoryIds:
    mockOrganizationCategories.find(
      (item) => Number(item.orgId) === Number(orgId),
    )?.categoryIds || [],
});

export const mockAssignOrganizationCategories = async () => mockNoResponse();

export const mockAddOrganizationCategory = async () => mockNoResponse();

export const mockRemoveOrganizationCategory = async () => mockNoResponse();
