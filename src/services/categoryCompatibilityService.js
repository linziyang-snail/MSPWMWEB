import { getOrganizations } from "./organizationService";

export const GetCompatibleCopyCategories = async () => {
  const organizations = await getOrganizations();
  const rows = Array.isArray(organizations) ? organizations : [];
  return rows
    .filter((org) => ["SECTION", "科別"].includes(org.orgType))
    .map((org) => ({
      id: org.id,
      categoryName: org.orgName,
      status: org.status,
      departmentId: org.parentId,
    }));
};
