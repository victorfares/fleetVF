import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignUpView.vue'),
    },
    {
      path: '/frota',
      name: 'fleet',
      component: () => import('@/views/FleetList.vue'),
    },
    
    // --- ROTAS ADMINISTRATIVAS ---
    {
      path: '/admin/cars',
      name: 'admin-cars',
      component: () => import('@/views/admin/CarsManager.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER'] }
    },
{
      path: '/admin/agencies',
      name: 'admin-agencies',
      component: () => import('@/views/admin/AgenciesManager.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER'] }
    },
    
    {
      path: '/meus-alugueis',
      name: 'my-rentals',
      component: () => import('@/views/HomeView.vue'), // Placeholder
      meta: { requiresAuth: true }
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.user?.role;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  if (isAuthenticated && (to.path === '/login' || to.path === '/signup')) {
    return next('/');
  }

  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    if (!userRole || !to.meta.roles.includes(userRole)) {
      alert('Acesso não autorizado para seu perfil.');
      return next('/');
    }
  }

  next();
});

export default router;