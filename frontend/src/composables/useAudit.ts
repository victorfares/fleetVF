import { ref } from "vue";
import api from "@/services/api";
import { useAppStore } from "@/stores/app";

export function useAudit() {
  const logs = ref([]);
  const loading = ref(false);
  const appStore = useAppStore();

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
      appStore.notifyError("Erro ao buscar logs de auditoria.");
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
