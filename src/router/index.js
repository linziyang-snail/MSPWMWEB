import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "@/stores/authStore";
import {
  canAccessRoles,
  normalizeRoles,
} from "@/utils/authRoles";
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.public) {
    return true;
  }
  if (
    to.meta.requiresAuth ||
    to.matched.some((record) => record.meta.requiresAuth)
  ) {
    if (!auth.isAuthenticated)
      return {
        name: "Login",
        query: { redirect: normalizeRedirect(to.fullPath) },
      };
  }
  const requiredRoles = to.matched.flatMap((record) => record.meta.roles || []);
  const roles = normalizeRoles(auth.roles);
  if (!canAccessRoles(roles, requiredRoles)) {
    return { name: "Forbidden" };
  }
  return true;
});

function normalizeRedirect(redirect) {
  if (typeof redirect !== "string") return "";
  if (
    !redirect.startsWith("/") ||
    redirect.startsWith("/login") ||
    redirect.startsWith("/403")
  ) return "";
  return redirect;
}

export default router;
