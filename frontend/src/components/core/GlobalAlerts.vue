<script setup lang="ts">
import { useAlertStore } from '@/stores/alert';

const alertStore = useAlertStore();
</script>

<template>
  <div class="position-fixed top-0 right-0 pa-4 mt-12" style="z-index: 9999; max-width: 450px; width: 100%; pointer-events: none;">
    <TransitionGroup name="alert-list">
      <div 
        v-for="alert in alertStore.alerts" 
        :key="alert.id" 
        class="mb-3" 
        style="pointer-events: auto;"
      >
        <v-alert
          :type="alert.type"
          :title="alert.title"
          :text="alert.message"
          closable
          variant="elevated"
          elevation="8"
          class="border font-weight-bold"
          @click:close="alertStore.removeAlert(alert.id)"
        ></v-alert>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.alert-list-enter-active,
.alert-list-leave-active {
  transition: all 0.4s ease;
}
.alert-list-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.alert-list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>