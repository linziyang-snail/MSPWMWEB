import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "@/stores/authStore";
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.public) return true;
  if (
    to.meta.requiresAuth ||
    to.matched.some((record) => record.meta.requiresAuth)
  ) {
    if (!auth.isAuthenticated)
      return { name: "Login", query: { redirect: to.fullPath } };
  }
  const requiredRoles = to.matched.flatMap((record) => record.meta.roles || []);
  if (requiredRoles.length && !requiredRoles.some((role) => auth.roles.includes(role))) {
    return { name: "Forbidden" };
  }
  return true;
});

export default router;
