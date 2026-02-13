import { ref } from 'vue';
import api from '@/services/api';
import type { Agency } from '@/types/Agency';
import { usePagination } from './usePagination';

export function useAgencies() {
  // --- Estado ---
  const agencies = ref<Agency[]>([]);
  const agency = ref<Agency | null>(null); 
  const loading = ref(false);
  const error = ref<string | null>(null);

  const { page, itemsPerPage, totalItems, pageCount, offset } = usePagination(10);
  const search = ref('');

  const handleError = (err: any, fallbackMsg: string) => {
    console.error(fallbackMsg, err);
    error.value = err.response?.data?.message || fallbackMsg;
  };

  const fetchAgencies = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await api.get('/agencies', {
        params: {
          limit: itemsPerPage.value,
          offset: offset.value,
          search: search.value || undefined,
        },
      });

      const responseData = data.data || data;
      const list = responseData.data || responseData;

      agencies.value = Array.isArray(list) ? list : [];
      totalItems.value = responseData.count || agencies.value.length;

    } catch (err) {
      handleError(err, 'Não foi possível carregar a lista de agências.');
    } finally {
      loading.value = false;
    }
  };

  const fetchAgencyById = async (id: string) => {
    loading.value = true;
    agency.value = null;
    error.value = null;

    try {
      const { data } = await api.get(`/agencies/${id}`);
      agency.value = data.data || data;
    } catch (err) {
      handleError(err, 'Erro ao carregar detalhes da agência.');
    } finally {
      loading.value = false;
    }
  };

  const deleteAgency = async (id: string) => {
    try {
      await api.delete(`/agencies/${id}`);
      await fetchAgencies();
      return true;
    } catch (err) {
      handleError(err, 'Falha ao excluir agência.');
      throw err;
    }
  };

  return {
    agencies,
    agency,
    loading,
    error,
    
    page,
    itemsPerPage,
    totalItems,
    pageCount,
    search,

    // Actions
    fetchAgencies,
    fetchAgencyById,
    deleteAgency,
  };
}