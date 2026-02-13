import { ref } from 'vue';
import api from '@/services/api';
import type { Car } from '@/types/Car';
import { usePagination } from './usePagination';

export function useCars() {
  // Estado da Lista
  const cars = ref<Car[]>([]);
  
  // Estado do Carro Único (Para a página de detalhes)
  const car = ref<Car | null>(null);

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Paginação
  const { page, itemsPerPage, totalItems, pageCount, offset } = usePagination(10);

  // Estado dos filtros simples (mantido para compatibilidade)
  const search = ref('');
  const agencyIdFilter = ref<string | null>(null);

  /**
   * Busca a lista de carros.
   * Agora aceita um objeto 'manualFilters' opcional para suportar
   * filtros avançados (datas, preço) vindos da Home ou FleetView.
   */
  const fetchCars = async (manualFilters: Record<string, any> = {}) => {
    loading.value = true;
    error.value = null;

    try {
      // 1. Monta os parâmetros base (Paginação)
      const params: any = {
        limit: itemsPerPage.value,
        offset: offset.value,
      };

      // 2. Adiciona filtros de estado reativo (Search/Agency do próprio hook)
      if (search.value) params.search = search.value;
      if (agencyIdFilter.value) params.agencyId = agencyIdFilter.value;

      // 3. Mescla com filtros manuais passados por argumento (Datas, Preço, etc)
      // Nota: Filtros manuais têm prioridade e sobrescrevem os anteriores se houver conflito
      Object.assign(params, manualFilters);

      // 4. Limpeza: Remove chaves vazias ou nulas para não enviar "null" como string
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
      );

      const { data } = await api.get('/cars', { params: cleanParams });

      // Tratamento robusto da resposta (para diferentes formatos de backend)
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