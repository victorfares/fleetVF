<template>
  <v-card 
    class="mx-auto h-100 d-flex flex-column" 
    elevation="2" 
    hover 
    border
    @click="$emit('edit', car)"
  >
    <v-img
      :src="car.imageUrl || 'https://cdn.vuetifyjs.com/images/cards/road.jpg'"
      height="200"
      cover
      class="align-end bg-grey-lighten-2"
    >
      <v-card-title class="text-white font-weight-bold" style="background: rgba(0,0,0,0.6)">
        {{car.brand}} {{ car.model }}
      </v-card-title>
    </v-img>

    <v-card-text class="pt-4 flex-grow-1">
      <div class="d-flex justify-space-between align-center mb-4">
        <v-chip
          :color="statusColors[car.status]"
          size="small"
          label
          class="font-weight-bold"
        >
          {{ statusTranslation[car.status] }}
        </v-chip>
        <span class="text-caption text-grey border px-2 py-1 rounded">
          {{ car.licensePlate }}
        </span>
      </div>

      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-center text-body-2 text-grey-darken-2">
          <v-icon icon="mdi-speedometer" size="small" class="mr-2" color="primary"></v-icon>
          {{ formatNumber(car.currentMileage) }} km
        </div>
        
        <div class="d-flex align-center text-body-2 text-grey-darken-2 mt-1">
          <v-icon icon="mdi-map-marker" size="small" class="mr-2" color="error"></v-icon>
          <span class="text-truncate">{{ car.agency?.city }} - {{ car.agency?.state }}</span>
        </div>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4 bg-grey-lighten-5">
      <div>
        <span class="text-caption text-grey">Diária</span>
        <div class="text-h6 font-weight-black text-grey-darken-4">
          {{ formatCurrency(car.dailyRate) }}
        </div>
      </div>
      
      <v-spacer></v-spacer>
      
      <v-btn 
        v-if="car.status === CarStatus.AVAILABLE"
        variant="tonal" 
        color="black" 
        class="font-weight-bold px-4"
        @click.stop="$emit('reserve', car.id)"
      >
        Reservar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { CarStatus } from '@/types/Car';
import type { Car } from '@/types/Car';

defineProps<{
  car: Car
}>();

defineEmits(['reserve', 'edit']);

const statusColors: Record<CarStatus, string> = {
  [CarStatus.AVAILABLE]: 'success',
  [CarStatus.RENTED]: 'info',
  [CarStatus.MAINTENANCE]: 'warning',
};

const statusTranslation: Record<CarStatus, string> = {
  [CarStatus.AVAILABLE]: 'Disponível',
  [CarStatus.RENTED]: 'Alugado',
  [CarStatus.MAINTENANCE]: 'Manutenção',
};

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatNumber = (val: number) => 
  new Intl.NumberFormat('pt-BR').format(val);
</script>