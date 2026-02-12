import { storeToRefs } from 'pinia';
import { useRentalStore } from '@/stores/rental';
import { useFormatters } from '@/composables/useFormatters'; // <--- Reutiliza sua lógica

export function useRentals() {
  const store = useRentalStore();
  const { rentals, totalItems, loading } = storeToRefs(store);
  const { formatCurrency, formatDate, formatRentalStatus, getRentalStatusColor } = useFormatters();

  return {
    rentals,
    totalItems,
    loading,
    
    createRental: store.createRental,
    fetchRentals: store.fetchRentals,
    checkIn: store.checkIn,
    finalizeRental: store.finalizeRental,
    
    formatCurrency,
    formatDate,
    formatRentalStatus,
    getRentalStatusColor
  };
}