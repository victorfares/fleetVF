<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import GlobalAlerts from '@/components/core/GlobalAlerts.vue';

const route = useRoute();
const authStore = useAuthStore();

const isBlankLayout = computed(() => route.meta.layout === 'blank');

onMounted(() => {
  if (authStore.token && !authStore.user) {
    authStore.fetchMe();
  }
});
</script>

<template>
  <v-app v-if="isBlankLayout">
    <router-view />
    <GlobalAlerts />
  </v-app>

  <DefaultLayout v-else>
    <router-view />
    <GlobalAlerts />
  </DefaultLayout>
</template>