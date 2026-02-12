import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import { useAppStore } from "@/stores/app";
import type {
  Rental,
  CreateRentalDto,
  FinalizeRentalDto,
} from "@/types/Rental";

export const useRentalStore = defineStore("rental", () => {
  const appStore = useAppStore();

  const rentals = ref<Rental[]>([]);
  const totalItems = ref(0);
  const loading = ref(false);

  async function createRental(dto: CreateRentalDto) {
    loading.value = true;
    try {
      const { data } = await api.post("/rentals", dto);
      appStore.notify("Reserva realizada com sucesso!", "success");
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao criar reserva.";
      const finalMsg = Array.isArray(msg) ? msg[0] : msg;

      appStore.notify(finalMsg, "error");
      
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRentals(
    params: { limit?: number; offset?: number } = {},
  ) {
    loading.value = true;
    try {
      const response = await api.get("/rentals", { params });

      const rootData = response.data;
      const payload = rootData.data ? rootData.data : rootData;

      if (payload && Array.isArray(payload.data)) {
        rentals.value = payload.data;
        totalItems.value = payload.count || 0;
      } else if (Array.isArray(payload)) {
        rentals.value = payload;
        totalItems.value = payload.length;
      } else {
        rentals.value = [];
        totalItems.value = 0;
      }
    } catch (err: any) {
      console.error("Erro ao buscar rentals:", err);
      appStore.notify("Não foi possível carregar os aluguéis.", "error");
    } finally {
      loading.value = false;
    }
  }

  async function checkIn(id: string) {
    loading.value = true;
    try {
      const { data } = await api.patch(`/rentals/${id}/check-in`);

      const index = rentals.value.findIndex((r) => r.id === id);
      if (index !== -1) rentals.value[index] = data;

      appStore.notify("Check-in realizado! Veículo liberado.", "success");
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao realizar Check-in.";
      appStore.notify(msg, "error");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function finalizeRental(id: string, dto: FinalizeRentalDto) {
    loading.value = true;
    try {
      const { data } = await api.patch(`/rentals/${id}`, dto);

      const index = rentals.value.findIndex((r) => r.id === id);
      if (index !== -1) rentals.value[index] = data;

      appStore.notify("Devolução registrada com sucesso!", "success");
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao finalizar aluguel.";
      appStore.notify(msg, "error");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    rentals,
    totalItems,
    loading,
    createRental,
    fetchRentals,
    checkIn,
    finalizeRental,
  };
});