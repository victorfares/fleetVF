import { ref } from 'vue';
import api from '@/services/api';
import type { Agency } from '@/types/Agency';

export function useAgencies() {
  const agencies = ref<Agency[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  const page = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  const search = ref('');

  const fetchAgencies = async () => {
    loading.value = true;
    error.value = null;

    try {
      const offset = (page.value - 1) * itemsPerPage.value;
      
      const { data } = await api.get('/agencies', {
        params: {
          limit: itemsPerPage.value,
          offset: offset,
          search: search.value || undefined,
        }
      });

      const responseData = data.data ? data.data : data;
      
      const extractedList = responseData.data || responseData;
      agencies.value = Array.isArray(extractedList) ? extractedList : [];
      totalItems.value = responseData.count || agencies.value.length;

    } catch (err: any) {
      console.error('Erro ao buscar agências:', err);
      error.value = 'Não foi possível carregar a lista de agências.';
    } finally {
      loading.value = false;
    }
  };

  const deleteAgency = async (id: string) => {
    try {
      await api.delete(`/agencies/${id}`);
      await fetchAgencies(); // Recarrega a lista
      return true;
    } catch (err) {
      console.error('Erro ao deletar agência:', err);
      throw new Error('Falha ao excluir agência.');
    }
  };

  return {
    agencies,
    loading,
    error,
    page,
    itemsPerPage,
    totalItems,
    search,
    fetchAgencies,
    deleteAgency
  };
}