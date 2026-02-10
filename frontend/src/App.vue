<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const route = useRoute();

const isBlankLayout = computed(() => route.meta.layout === 'blank');
</script>

<template>
  <v-app v-if="isBlankLayout" style="font-family: 'Inter', sans-serif;">
    <router-view />
  </v-app>

  <DefaultLayout v-else>
    <router-view />
  </DefaultLayout>
</template>

<style>
/* Estilos globais */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

html, body {
  font-family: 'Inter', sans-serif;
  background-color: #F8FAFC;
}
</style>