<template>
  <v-card elevation="0" class="h-100 rounded-lg border hover-card bg-white">
    <v-card-item>
      <template v-slot:prepend>
        <v-avatar color="black" variant="tonal" rounded="lg">
          <v-icon icon="mdi-office-building"></v-icon>
        </v-avatar>
      </template>
      
      <v-card-title class="text-body-1 font-weight-black text-black">
        {{ agency.name }}
      </v-card-title>
      
      <v-card-subtitle class="text-caption font-weight-bold text-grey-darken-3">
        ID: #{{ agency.id }}
      </v-card-subtitle>
    </v-card-item>

    <v-divider class="border-opacity-100"></v-divider>

    <v-card-text class="py-4">
      <div class="d-flex align-center mb-3">
        <v-icon icon="mdi-map-marker" size="small" class="mr-3 text-black"></v-icon>
        <span class="text-body-2 text-black font-weight-bold">
          {{ agency.city }} - {{ agency.state }}
        </span>
      </div>

      <div class="d-flex align-center">
        <v-icon icon="mdi-home-map-marker" size="small" class="mr-3 text-black"></v-icon>
        <span class="text-caption text-grey-darken-4 font-weight-medium text-truncate">
          {{ agency.address }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions class="pa-3 pt-0">
      <v-btn 
        variant="flat" 
        color="grey-lighten-3"
        class="text-black font-weight-bold"
        block 
        size="small"
        @click="$emit('edit', agency)"
      >
        Editar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Agency } from '@/types/Agency';

defineProps<{
  agency: Agency
}>();

defineEmits(['edit']);
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  border-color: black !important;
}
</style>