<script setup lang="ts">
import type { Agency } from '@/types/Agency';

defineProps<{
  agency: Agency,
  isPublic?: boolean
}>();

defineEmits(['edit']);
</script>

<template>
  <v-card 
    :to="isPublic ? `/agencias/${agency.id}` : undefined"
    class="h-100 d-flex flex-column cursor-pointer" 
    elevation="0" 
    border
    hover
    rounded="xl"
  >
    <v-card-item class="pt-4">
      <template v-slot:prepend>
        <v-avatar color="grey-lighten-4" rounded="lg" size="48">
          <v-icon icon="mdi-office-building" color="black" size="24"></v-icon>
        </v-avatar>
      </template>

      <v-card-title class="font-weight-black text-body-1 text-black">
        {{ agency.name }}
      </v-card-title>

      <v-card-subtitle class="text-caption font-weight-bold text-grey-darken-3 opacity-100 mt-1">
        {{ agency.city }} - {{ agency.state }}
      </v-card-subtitle>
    </v-card-item>

    <v-divider class="my-2 border-opacity-25"></v-divider>

    <v-card-text class="flex-grow-1 py-2">
      <div class="d-flex align-start ga-3">
        <v-icon icon="mdi-map-marker-outline" size="small" color="black" class="mt-1"></v-icon>
        <span class="text-caption text-grey-darken-4 font-weight-medium" style="line-height: 1.5;">
          {{ agency.address }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-btn 
        v-if="isPublic"
        variant="flat" 
        color="black"
        class="font-weight-bold text-white"
        block 
        rounded="lg"
        :to="`/agencias/${agency.id}`"
      >
        Ver Frota Disponível
      </v-btn>

      <v-btn 
        v-else
        variant="tonal" 
        color="grey-darken-4"
        class="font-weight-bold"
        block 
        rounded="lg"
        @click.stop="$emit('edit', agency)"
      >
        Editar Dados
      </v-btn>
    </v-card-actions>
  </v-card>
</template>