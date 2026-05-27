import { ROLE } from "@/utils/constants";

export const ROLES = ROLE;

export function normalizeRoles(roles = []) {
  if (!Array.isArray(roles)) return [];
  return [
    ...new Set(
      roles
        .map((role) => String(role).toUpperCase())
        .filter((role) => Object.values(ROLES).includes(role))
        .filter(Boolean),
    ),
  ];
}

export function hasAdminRole(roles = []) {
  return normalizeRoles(roles).includes(ROLES.ADMIN);
}

export function canAccessRoles(userRoles = [], allowedRoles = []) {
  const normalizedUserRoles = normalizeRoles(userRoles);
  if (!allowedRoles?.length) return true;
  if (hasAdminRole(normalizedUserRoles)) return true;
  const normalizedAllowedRoles = normalizeRoles(allowedRoles);
  return normalizedAllowedRoles.some((role) => normalizedUserRoles.includes(role));
}

export function hasAnyRole(userRoles = [], allowedRoles = []) {
  const normalizedUserRoles = normalizeRoles(userRoles);
  if (!allowedRoles?.length) return true;
  const normalizedAllowedRoles = normalizeRoles(allowedRoles);
  return normalizedAllowedRoles.some((role) => normalizedUserRoles.includes(role));
}

export function getDefaultEntryPathForRoles(roles = []) {
  const normalizedRoles = normalizeRoles(roles);
  if (hasAdminRole(normalizedRoles)) return "/accounts/pending-changes";
  if (normalizedRoles.includes(ROLES.MANAGER)) return "/copies/all";
  if (normalizedRoles.includes(ROLES.USER)) return "/copies/all";
  return "/copies/all";
}
