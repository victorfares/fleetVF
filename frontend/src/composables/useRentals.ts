import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useRentalStore } from "@/stores/rental";
import { useFormatters } from "@/composables/useFormatters";
import type { Rental } from "@/types/Rental";

export function useRentals() {
  const store = useRentalStore();
  const { rentals, totalItems, loading, error } = storeToRefs(store);
  const {
    formatCurrency,
    formatDate,
    formatRentalStatus,
    getRentalStatusColor,
  } = useFormatters();

  const filters = ref({
    status: null,
    search: "",
    startDateMin: null,
    startDateMax: null,
  });

  const isLate = (rental: Rental) => {
    const end = new Date(rental.endDate);

    if (rental.status === "COMPLETED" && rental.realReturnDate) {
      return new Date(rental.realReturnDate) > end;
    }

    if (rental.status === "ACTIVE" || rental.status === "CONFIRMED") {
      return new Date() > end;
    }

    return false;
  };

  // Wrapper que adapta as opções do Vuetify para os Params da API
  const fetchRentals = async (options: any = {}) => {
    const { page = 1, itemsPerPage = 10, sortBy = [] } = options;

    const params: any = {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      search: filters.value.search || undefined,
      status: filters.value.status || undefined,
      startDateMin: filters.value.startDateMin || undefined,
      startDateMax: filters.value.startDateMax || undefined,
    };

    if (sortBy.length) {
      params.orderBy = sortBy[0].key;
      params.orderDirection = sortBy[0].order === "asc" ? "ASC" : "DESC";
    }

    await store.fetchRentals(params);
  };

  return {
    rentals,
    totalItems,
    loading,
    error,
    filters,

    fetchRentals,
    createRental: store.createRental,
    checkIn: store.checkIn,
    finalizeRental: store.finalizeRental,

    isLate,
    formatCurrency,
    formatDate,
    formatRentalStatus,
    getRentalStatusColor,
  };
}
