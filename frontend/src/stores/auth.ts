import { defineStore } from "pinia";
import api from "@/services/api";
import type { User } from "@/types/Auth";

interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("token") || null,
    user: (() => {
      const stored = localStorage.getItem("user");
      try {
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })(),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "ADMIN",
    isManager: (state) =>
      state.user?.role === "MANAGER" || state.user?.role === "ADMIN",
  },

  actions: {
    async login(payload: any) {
      try {
        const response = await api.post("/auth/login", payload);
        const body = response.data;

        const data = body.data || body;
        const token = data.access_token || data.token;
        const user = data.user;

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
        console.error("Erro no Login:", error);
        throw error;
      }
    },

    // --- ATUALIZADO AQUI ---
    async register(payload: any) {
      try {
        const response = await api.post("/auth/signup", payload);
        const body = response.data;

        const data = body.data || body;
        const token = data.access_token || data.token;
        const user = data.user;
        if (token) {
          this.setToken(token);

          if (user) {
            this.setUser(user);
          } else {
            await this.fetchUserProfile();
          }
          return true; 
        }

        return false;
      } catch (error) {
        console.error("Erro no Registro:", error);
        throw error;
      }
    },

    async fetchUserProfile() {
      try {
        if (!this.token) return;

        const response = await api.get("/users/me");
        const body = response.data;
        const userData = body.data || body;

        this.setUser(userData);
      } catch (error: any) {
        console.error("Erro ao buscar perfil:", error);
        if (error.response?.status === 401) {
          this.logout();
        }
      }
    },

    setToken(token: string) {
      this.token = token;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },

    setUser(user: User) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },

    logout() {
      console.log("🚪 Executando Logout...");
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
    },
  },
});
