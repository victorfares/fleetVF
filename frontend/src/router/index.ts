import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- ROTAS PÚBLICAS (Acessíveis sem login) ---
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: false } // Explícito: Não precisa de senha
    },
    {
      path: '/frota',
      name: 'fleet-list',
      component: () => import('@/views/FleetList.vue'),
      meta: { requiresAuth: false } // Explícito
    },
    {
      path: '/agencias',
      name: 'agencies-list',
      component: () => import('@/views/AgenciesList.vue'),
      meta: { requiresAuth: false } // Explícito
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignUpView.vue'),
      meta: { requiresAuth: false }
    },

    // --- ROTAS DO CLIENTE (Requer Login) ---
    {
      path: '/meus-alugueis',
      name: 'my-rentals',
      component: () => import('@/views/HomeView.vue'), // Placeholder
      meta: { requiresAuth: true }
    },

    // --- ROTAS ADMINISTRATIVAS (Requer Login + Permissão) ---
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
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
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