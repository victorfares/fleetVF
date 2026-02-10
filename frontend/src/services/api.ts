import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição
api.interceptors.request.use((config) => {
  const authStore = useAuthStore(); 
  const token = authStore.token;
  // 👇 ADICIONE ISSO PARA DEBUGAR
  console.log('🔐 Interceptor rodando. Token:', token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      
      console.warn('Sessão expirada. Deslogando via Pinia...');
      authStore.logout();
      
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;