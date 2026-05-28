import { isSectionOrganization } from "@/utils/constants";

import { getOrganizations } from "./organizationService";

export const GetCompatibleCopyCategories = async () => {
  const organizations = await getOrganizations({ status: "ACTIVE" });
  const rows = Array.isArray(organizations) ? organizations : [];
  return rows
    .filter(isSectionOrganization)
    .map((org) => ({
      id: org.id,
      categoryName: org.orgName,
      status: org.status,
      departmentId: org.parentId,
    }));
};
