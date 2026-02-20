import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";
import type { User } from "@/types/Auth";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token") || null);

  const user = ref<User | null>(
    (() => {
      const stored = localStorage.getItem("user");
      try {
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })(),
  );

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "ADMIN");
  const isManager = computed(
    () => user.value?.role === "MANAGER" || user.value?.role === "ADMIN",
  );

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  function setUser(newUser: User) {
    user.value = newUser;
    localStorage.setItem("user", JSON.stringify(newUser));
  }

  function logout() {
    console.log("🚪 Executando Logout...");
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  async function fetchMe() {
    if (!token.value) return;

    try {
      const response = await api.get("/users/me");
      const body = response.data;
      const userData = body.data || body;

      setUser(userData);
    } catch (error: any) {
      throw error;
    }
  }

  async function login(payload: any) {
    try {
      const response = await api.post("/auth/login", payload);
      const body = response.data;

      const data = body.data || body;
      const accessToken = data.access_token || data.token;
      const userData = data.user;

      if (!accessToken) {
        throw new Error("Token de autenticação não encontrado na resposta.");
      }

      setToken(accessToken);

      if (userData) {
        setUser(userData);
      } else {
        await fetchMe();
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async function register(payload: any) {
    try {
      const response = await api.post("/auth/signup", payload);
      const body = response.data;

      const data = body.data || body;
      const accessToken = data.access_token || data.token;
      const userData = data.user;

      if (accessToken) {
        setToken(accessToken);

        if (userData) {
          setUser(userData);
        } else {
          await fetchMe();
        }
        return true;
      }

      return false;
    } catch (error) {
      throw error;
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isManager,
    setToken,
    setUser,
    login,
    register,
    fetchMe,
    logout,
  };
});
