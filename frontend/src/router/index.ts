import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAlertStore } from "@/stores/alert";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- ROTAS PÚBLICAS ---
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/frota",
      name: "fleet-list",
      component: () => import("@/views/FleetList.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/agencias",
      name: "agencies-list",
      component: () => import("@/views/AgenciesList.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("@/views/SignUpView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/frota/:id",
      name: "car-details",
      component: () => import("@/views/CarDetailsView.vue"),
      props: true,
    },
    {
      path: "/agencias/:id",
      name: "agency-details",
      component: () => import("@/views/AgencyDetailsView.vue"),
      props: true,
    },

    // --- ROTAS DO CLIENTE ---
    {
      path: "/meus-alugueis",
      name: "meus-alugueis",
      component: () => import("@/views/MyRentalsView.vue"),
      meta: { requiresAuth: true },
    },

    // --- ROTAS ADMINISTRATIVAS ---
    {
      path: "/admin/cars",
      name: "admin-cars",
      component: () => import("@/views/admin/CarsManager.vue"),
      meta: { requiresAuth: true, roles: ["ADMIN", "MANAGER"] },
    },
    {
      path: "/admin/agencies",
      name: "admin-agencies",
      component: () => import("@/views/admin/AgenciesManager.vue"),
      meta: { requiresAuth: true, roles: ["ADMIN", "MANAGER"] },
    },
    {
      path: "/admin/reservas",
      name: "admin-reservas",
      component: () => import("@/views/admin/AdminRentalsView.vue"),
      meta: { requiresAuth: true, roles: ["ADMIN", "MANAGER"] },
    },
    {
      path: "/admin/auditoria",
      name: "admin-audit",
      component: () => import("@/views/admin/AuditLogsView.vue"),
      meta: { requiresAuth: true, roles: ["ADMIN"] },
    },
    {
      path: "/admin/usuarios",
      name: "admin-users",
      component: () => import("@/views/admin/UsersManagerView.vue"),
      meta: { requiresAuth: true, roles: ["ADMIN", "MANAGER"] },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const alertStore = useAlertStore();

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  if (isAuthenticated && (to.path === "/login" || to.path === "/signup")) {
    return next("/");
  }

  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    if (!userRole || !to.meta.roles.includes(userRole)) {
      alertStore.showError("Acesso não autorizado para seu perfil.");
      return next("/");
    }
  }

  next();
});

export default router;