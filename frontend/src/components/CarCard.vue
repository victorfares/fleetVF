<template>
  <v-card 
    elevation="0" 
    class="h-100 rounded-lg border cursor-pointer transition-swing"
    hover
  >
    <v-img
      :src="car.imageUrl || 'https://placehold.co/600x400?text=Sem+Imagem'"
      height="200"
      cover
      class="bg-grey-lighten-3"
    >
      <div class="d-flex justify-end pa-2">
        <v-chip 
          :color="getStatusColor(car.status)" 
          class="font-weight-bold" 
          size="small" 
          variant="flat"
        >
          {{ formatStatus(car.status) }}
        </v-chip>
      </div>
    </v-img>

    <v-divider></v-divider>

    <v-card-item class="pb-0">
      <div class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
        {{ formatCurrency(car.dailyRate) }}
        <span class="text-caption text-grey font-weight-regular">/dia</span>
      </div>
      <div class="text-body-1 text-truncate text-black font-weight-bold">
        {{ car.brand }} {{ car.model }}
      </div>
    </v-card-item>

    <v-card-text class="pt-2 text-caption text-grey-darken-1">
      <div class="d-flex align-center mb-1">
        <v-icon icon="mdi-speedometer" size="small" class="mr-1"></v-icon>
        {{ car.currentMileage.toLocaleString('pt-BR') }} km
      </div>
      <div class="d-flex align-center">
        <v-icon icon="mdi-map-marker" size="small" class="mr-1"></v-icon>
        {{ car.agency?.city }} - {{ car.agency?.state }}
      </div>
    </v-card-text>

    <v-card-actions class="px-4 pb-4 pt-0">
      <v-btn 
        block 
        variant="flat" 
        color="secondary" 
        :disabled="car.status !== 'AVAILABLE'"
        @click="$emit('reserve', car.id)"
      >
        {{ car.status === 'AVAILABLE' ? 'Reservar Agora' : 'Indisponível' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Car } from '@/types/Car';
import { useFormatters } from '@/composables/useFormatters';

defineProps<{
  car: Car
}>();

defineEmits(['reserve']);

const { formatCurrency, formatStatus, getStatusColor } = useFormatters();
</script>

<style scoped>
.transition-swing {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.v-card--hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}
</style>