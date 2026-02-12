import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config && error.config.url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();

      console.warn('Sessão expirada. Deslogando...');
      authStore.logout();

      // Usa window.location para garantir limpeza total de estado
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;