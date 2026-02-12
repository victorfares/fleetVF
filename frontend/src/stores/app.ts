import { defineStore } from 'pinia';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface AppNotification {
  show: boolean;
  message: string;
  type: NotificationType;
}

interface AppState {
  globalLoading: boolean;
  notification: AppNotification;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    globalLoading: false,
    notification: {
      show: false,
      message: '',
      type: 'info',
    },
  }),
  actions: {
    setGlobalLoading(value: boolean) {
      this.globalLoading = value;
    },
    notify(message: string, type: NotificationType = 'info') {
      this.notification = {
        show: true,
        message,
        type,
      };
    },
    notifySuccess(message: string) {
      this.notify(message, 'success');
    },
    notifyError(message: string) {
      this.notify(message, 'error');
    },
    notifyWarning(message: string) {
      this.notify(message, 'warning');
    },
    clearNotification() {
      this.notification.show = false;
      this.notification.message = '';
    },
  },
});
