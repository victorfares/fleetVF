import { ref, watch } from 'vue';
import api from '@/services/api';
import type { Car, CarResponse } from '@/types/Car';

export function useCars() {
  const cars = ref<Car[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  const page = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  const search = ref('');

  const fetchCars = async () => {
    loading.value = true;
    error.value = null;

    try {
      const offset = (page.value - 1) * itemsPerPage.value;

      const { data } = await api.get('/cars', {
        params: {
          limit: itemsPerPage.value,
          offset: offset,
          search: search.value || undefined, // Só envia se tiver valor
        }
      });
      const responseData = data.data ? data.data : data; 
      
      cars.value = (responseData.data || responseData) as Car[];
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
      console.error('Erro ao deletar:', err);
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
    search,
    fetchCars,
    deleteCar,
  };
}