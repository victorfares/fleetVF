import { defineStore } from 'pinia';
import api from '@/services/api';
import type { User, AuthResponse } from '@/types/Auth';

interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isManager: (state) => state.user?.role === 'MANAGER' || state.user?.role === 'ADMIN',
  },

  actions: {
    async login(payload: any) {
      try {
        const response = await api.post('/auth/login', payload);
        const body = response.data;
        const token = body.data?.access_token || body.access_token || body.token;
        const user = body.data?.user || body.user;

        if (!token) {
          throw new Error("Token de autenticação não encontrado na resposta.");
        }

        this.setToken(token);
        if (user) {
          this.setUser(user);
        } else {
          await this.fetchUserProfile();
        }

        return true;
      } catch (error) {
        console.error('Erro no Login:', error);
        throw error;
      }
    },

    async register(payload: any) {
      await api.post('/auth/signup', payload);
    },

    async fetchUserProfile() {
      try {
        const response = await api.get('/users/me');
        const body = response.data;
        const userData = body.data || body;

        this.setUser(userData);
      } catch (error: any) {
        console.error('Erro ao buscar perfil:', error);
      }
    },

    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
    },

    setUser(user: User) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },

    logout() {
      console.log('🚪 Executando Logout...');
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});