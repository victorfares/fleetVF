import { ref } from 'vue';
import api from '@/services/api';
import { useAlertStore } from '@/stores/alert';

export function useUsers() {

  const users = ref<any[]>([]);
  const loading = ref(false);
  const totalItems = ref(0);

  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');

  const alertStore = useAlertStore();

  const fetchUsers = async () => {
    loading.value = true;
    try {
      const offset = (page.value - 1) * itemsPerPage.value;

      const response = await api.get('/users', {
        params: {
          limit: itemsPerPage.value,
          offset: offset,
          search: search.value || undefined,
        },
      });

      let fetchedData = [];
      let fetchedCount = 0;

      const payload = response.data;

      if (Array.isArray(payload)) {
        fetchedData = payload;
        fetchedCount = payload.length;
      } 
      else if (payload && Array.isArray(payload.data)) {
        fetchedData = payload.data;
        fetchedCount = payload.count !== undefined ? payload.count : payload.data.length;
      } 
      else if (payload && payload.data && Array.isArray(payload.data.data)) {
        fetchedData = payload.data.data;
        fetchedCount = payload.data.count !== undefined ? payload.data.count : payload.data.data.length;
      } 
      else {
        console.warn('Formato de resposta inesperado da API:', payload);
      }

      users.value = fetchedData;
      totalItems.value = fetchedCount;
      
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alertStore.showError('Erro ao buscar a lista de usuários.');
      users.value = [];
      totalItems.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      alertStore.showSuccess('Usuário removido com sucesso!');
      await fetchUsers();
    } catch (error: any) {
      alertStore.showError(
        error.response?.data?.message || 'Erro ao remover usuário. Verifique se ele possui dependências.'
      );
      throw error;
    }
  };

  return {
    users,
    loading,
    totalItems,
    page,
    itemsPerPage,
    search,
    fetchUsers,
    deleteUser,
  };
}