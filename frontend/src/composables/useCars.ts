import { ref } from 'vue';
import api from '@/services/api';
import type { Car } from '@/types/Car';
import { usePagination } from './usePagination';

export function useCars() {
  const cars = ref<Car[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const { page, itemsPerPage, totalItems, pageCount, offset } = usePagination(10);

  const search = ref('');
  const agencyIdFilter = ref<string | null>(null);

  const fetchCars = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get('/cars', {
        params: {
          limit: itemsPerPage.value,
          offset: offset.value,
          search: search.value || undefined,
          agencyId: agencyIdFilter.value || undefined,
        },
      });

      const responseData = data.data ? data.data : data;

      const extractedList = responseData.data || responseData;
      cars.value = Array.isArray(extractedList) ? extractedList : [];
      totalItems.value = responseData.count || cars.value.length;
    } catch (err: any) {
      console.error('Erro ao buscar veículos:', err);
      error.value = 'Não foi possível carregar a lista de veículos.';
    } finally {
      loading.value = false;
    }
  };

  const deleteCar = async (id: string) => {
    try {
      await api.delete(`/cars/${id}`);
      await fetchCars();
      return true;
    } catch (err) {
      console.error('Erro ao deletar veículo:', err);
      throw new Error('Falha ao excluir veículo.');
    }
  };

  return {
    cars,
    loading,
    error,
    page,
    itemsPerPage,
    totalItems,
    pageCount,
    search,
    agencyIdFilter,
    fetchCars,
    deleteCar,
  };
}