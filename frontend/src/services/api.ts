import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useAlertStore } from '@/stores/alert';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    const alertStore = useAlertStore();

    if (error.response && error.response.data) {
      const message = error.response.data.message || 'Ocorreu um erro no servidor.';
      
      const finalMessage = Array.isArray(message) ? message[0] : message;

      if (error.response.status !== 401) {
        alertStore.showError(finalMessage);
      }
    } else if (error.message === 'Network Error') {
      alertStore.showError('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }

    if (error.config && error.config.url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();

      console.warn('Sessão expirada. Deslogando...');
      authStore.logout();

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;