import { createRouter, createWebHistory } from "vue-router";

import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import {
  canAccessRoles,
  getDefaultEntryPathForRoles,
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
    // Role mismatch (e.g. a leftover ?redirect= from another role's session,
    // or a manually typed URL): bounce to this role's home with a notice
    // instead of showing the /403 page.
    const fallbackPath = getDefaultEntryPathForRoles(roles);
    const fallbackRoles = router
      .resolve(fallbackPath)
      .matched.flatMap((record) => record.meta.roles || []);
    if (to.path !== fallbackPath && canAccessRoles(roles, fallbackRoles)) {
      useAppStore().showAlert({
        title: "權限不足",
        message: "您沒有權限進入該頁面，已為您導向首頁。",
        variant: "warning",
      });
      return { path: fallbackPath };
    }
    // Fallback for empty/invalid roles where even home is not accessible —
    // go to /403 to avoid a redirect loop.
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
