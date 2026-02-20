import { ref } from "vue";
import api from "@/services/api";
import { useAlertStore } from "@/stores/alert";

export function useAudit() {
  const logs = ref<any[]>([]);
  const alertStore = useAlertStore();
  const loading = ref(false);

  const fetchLogs = async () => {
    loading.value = true;
    try {
      const response = await api.get("/audit");
      if (Array.isArray(response.data)) {
        logs.value = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        logs.value = response.data.data;
      } else {
        logs.value = [];
      }
    } catch (error) {
      console.error(error);
      alertStore.showError("Erro ao buscar logs de auditoria.");
    } finally {
      loading.value = false;
    }
  };

  return {
    logs,
    loading,
    fetchLogs,
  };
}