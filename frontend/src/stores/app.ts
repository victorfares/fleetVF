import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const notification = ref({
    show: false,
    type: 'info',
    message: '',
  });
  function notify(type: string, message: string) {
    notification.value = {
      show: true,
      type,
      message,
    };
  }

  function clearNotification() {
    notification.value.show = false;
  }

  return {
    notification,
    notify,
    clearNotification,
  };
});