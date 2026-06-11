import { normalizeOrgTypeValue } from "@/utils/constants";

import apiRequest, { unwrapApiBody } from "./apiRequest";

const organizationsCache = {};
const organizationsInFlight = {};

export async function getOrganizations(params = {}) {
  const { status, force = false } = params || {};
  const cacheKey = buildOrganizationsKey(status);
  if (organizationsCache[cacheKey] && !force) return organizationsCache[cacheKey];
  if (organizationsInFlight[cacheKey] && !force) return organizationsInFlight[cacheKey];

  organizationsInFlight[cacheKey] = apiRequest.get("/api/organizations", {
    params: pruneEmptyParams({ status }),
  })
    .then(unwrapApiBody)
    .then((rows) => {
      organizationsCache[cacheKey] = rows;
      return rows;
    })
    .finally(() => {
      delete organizationsInFlight[cacheKey];
    });
  return organizationsInFlight[cacheKey];
}

export async function createOrganization(payload) {
  const { orgName, orgType } = payload || {};
  const body = { orgName, orgType: normalizeOrgTypeValue(orgType) };
  const response = await apiRequest.post("/api/organizations", body);
  invalidateOrganizationsCache();
  return response;
}

export async function updateOrganization(params, legacyPayload) {
  const { id, orgName } = normalizeOrganizationUpdateParams(
    params,
    legacyPayload,
  );
  const body = { orgName };
  const response = await apiRequest.put(`/api/organizations/${id}`, body);
  invalidateOrganizationsCache();
  return response;
}

export async function disableOrganization(params) {
  const { id } = normalizeIdParams(params);
  const response = await apiRequest.delete(`/api/organizations/${id}`);
  invalidateOrganizationsCache();
  return response;
}

export function invalidateOrganizationsCache() {
  invalidateOrganizations();
}

export function invalidateOrganizations(status) {
  if (status) {
    const cacheKey = buildOrganizationsKey(status);
    delete organizationsCache[cacheKey];
    delete organizationsInFlight[cacheKey];
    return;
  }
  Object.keys(organizationsCache).forEach((key) => delete organizationsCache[key]);
  Object.keys(organizationsInFlight).forEach((key) => delete organizationsInFlight[key]);
}

function normalizeIdParams(params) {
  if (params && typeof params === "object") return params;
  return { id: params };
}

function normalizeOrganizationUpdateParams(params, legacyPayload) {
  if (legacyPayload) return { id: params, ...legacyPayload };
  return params || {};
}

function pruneEmptyParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function buildOrganizationsKey(status = "") {
  return `organizations:${status || "ALL"}`;
}
