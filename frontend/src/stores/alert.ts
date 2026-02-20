import { defineStore } from 'pinia';
import { ref } from 'vue';

// Define o formato perfeito para o v-alert do Vuetify
export interface AlertMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export const useAlertStore = defineStore('alert', () => {
  const alerts = ref<AlertMessage[]>([]);

  const removeAlert = (id: string) => {
    alerts.value = alerts.value.filter((alert) => alert.id !== id);
  };

  const addAlert = (alert: Omit<AlertMessage, 'id'>, timeout = 5000) => {
    const id = Math.random().toString(36).substring(2, 9); // Gera ID único
    alerts.value.push({ ...alert, id });

    if (timeout > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, timeout);
    }
  };



  const showSuccess = (message: string, title = 'Sucesso!') => {
    addAlert({ type: 'success', message, title });
  };

  const showError = (message: string, title = 'Atenção! Erro detectado') => {
    addAlert({ type: 'error', message, title }, 8000); // Erros ficam 8 segundos na tela
  };

  const showWarning = (message: string, title = 'Aviso') => {
    addAlert({ type: 'warning', message, title });
  };

  const showInfo = (message: string, title = 'Informação') => {
    addAlert({ type: 'info', message, title });
  };

  return {
    alerts,
    removeAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
});