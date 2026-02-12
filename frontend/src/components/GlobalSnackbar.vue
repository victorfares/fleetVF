<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const { notification } = storeToRefs(appStore);

const isVisible = computed({
  get: () => notification.value.show,
  set: (value: boolean) => {
    if (!value) {
      appStore.clearNotification();
    }
  },
});

const color = computed(() => {
  switch (notification.value.type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
});
</script>

<template>
  <v-snackbar
    v-model="isVisible"
    :color="color"
    location="bottom right"
    timeout="4000"
    variant="elevated"
  >
    {{ notification.message }}
  </v-snackbar>
</template>

