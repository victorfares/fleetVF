import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import { useAlertStore } from "@/stores/alert";
import type {
  Rental,
  CreateRentalDto,
  FinalizeRentalDto,
} from "@/types/Rental";

export const useRentalStore = defineStore("rental", () => {
  const alertStore = useAlertStore();

  const rentals = ref<Rental[]>([]);
  const totalItems = ref(0);
  const loading = ref(false);

  async function createRental(dto: CreateRentalDto) {
    loading.value = true;
    try {
      const { data } = await api.post("/rentals", dto);
      return data;
    } catch (err: any) {
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

      alertStore.showSuccess("Check-in realizado! Veículo liberado.");
      return data;
    } catch (err: any) {
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
      alertStore.showSuccess("Devolução registrada com sucesso!");
      return data;
    } catch (err: any) {
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function cancelRental(id: string) {
    loading.value = true;
    try {
      const { data } = await api.patch(`/rentals/${id}/cancel`);

      const index = rentals.value.findIndex((r) => r.id === id);
      if (index !== -1) rentals.value[index] = data;

      alertStore.showSuccess("Reserva cancelada com sucesso.");
      return data;
    } catch (err: any) {
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
    cancelRental, 
  };
});