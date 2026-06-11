import apiRequest, { unwrapApiBody } from "./apiRequest";

let rolesCache = null;
let rolesPromise = null;

export async function getRoles(options = {}) {
  const { force = false } = options || {};
  if (rolesCache && !force) return rolesCache;
  if (rolesPromise && !force) return rolesPromise;
  rolesPromise = apiRequest.get("/api/roles")
    .then(unwrapApiBody)
    .then((rows) => {
      rolesCache = rows;
      return rows;
    })
    .finally(() => {
      rolesPromise = null;
    });
  return rolesPromise;
}
