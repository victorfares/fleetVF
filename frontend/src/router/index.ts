import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { layout: 'blank' }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/cars',
      name: 'admin-cars',
      component: () => import('@/views/admin/CarsManager.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER'] }
    },
    // ... outras rotas
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  if (to.meta.roles) {
    const requiredRoles = to.meta.roles as string[];
    if (userRole && !requiredRoles.includes(userRole)) {
      // Usuário logado mas sem permissão
      return next('/'); // Ou página de "Acesso Negado"
    }
  }

  next();
});

export default router;