import { ref } from 'vue';
import api from '@/services/api';
import type { Car } from '@/types/Car';
import { usePagination } from './usePagination';

export function useCars() {
  const cars = ref<Car[]>([]);
  
  const car = ref<Car | null>(null);

  const loading = ref(false);
  const error = ref<string | null>(null);

  const { page, itemsPerPage, totalItems, pageCount, offset } = usePagination(10);

  const search = ref('');
  const agencyIdFilter = ref<string | null>(null);


  const fetchCars = async (manualFilters: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const params: any = {
        limit: itemsPerPage.value,
        offset: offset.value,
      };

      if (search.value) params.search = search.value;
      if (agencyIdFilter.value) params.agencyId = agencyIdFilter.value;

      Object.assign(params, manualFilters);

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
      );

      const { data } = await api.get('/cars', { params: cleanParams });

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

  const fetchCarById = async (id: string) => {
    loading.value = true;
    error.value = null;
    car.value = null;

    try {
      const { data } = await api.get(`/cars/${id}`);
      car.value = data.data || data; 
    } catch (err: any) {
      console.error('Erro ao buscar detalhes do carro:', err);
      error.value = 'Não foi possível carregar os detalhes do veículo.';
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
    car,
    loading,
    error,
    
    page,
    itemsPerPage,
    totalItems,
    pageCount,
    search,
    agencyIdFilter,

    fetchCars,
    fetchCarById,
    deleteCar,
  };
}