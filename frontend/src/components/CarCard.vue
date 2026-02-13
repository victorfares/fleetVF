<script setup lang="ts">
import { useFormatters } from '@/composables/useFormatters';
import { CarStatus } from '@/types/Car'; // Ajuste o import conforme seu projeto
import type { Car } from '@/types/Car';

defineProps<{
  car: Car
}>();

const { formatCurrency } = useFormatters();

const statusConfig: Record<string, { color: string; label: string }> = {
  AVAILABLE: { color: 'success', label: 'Disponível' },
  RENTED: { color: 'warning', label: 'Alugado' },
  MAINTENANCE: { color: 'error', label: 'Manutenção' },
};

const formatKm = (val: number) => new Intl.NumberFormat('pt-BR').format(val);
</script>

<template>
  <v-card 
    :to="`/frota/${car.id}`"
    class="mx-auto h-100 d-flex flex-column" 
    elevation="2" 
    hover 
    border
    rounded="xl"
  >
    <v-img
      :src="car.imageUrl || 'https://cdn.vuetifyjs.com/images/cards/road.jpg'"
      height="220"
      cover
      class="align-end"
      gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,0.9)"
    >
      <div class="px-4 pb-4 text-white">
        <div class="text-overline mb-n1 text-grey-lighten-2">{{ car.brand }}</div>
        <div class="text-h5 font-weight-bold">{{ car.model }}</div>
      </div>
    </v-img>

    <v-card-text class="pt-4 flex-grow-1">
      <div class="d-flex justify-space-between align-center mb-4">
        <v-chip
          :color="statusConfig[car.status]?.color || 'grey'"
          size="small"
          label
          class="font-weight-bold text-uppercase"
        >
          {{ statusConfig[car.status]?.label || car.status }}
        </v-chip>
        
        <div class="text-caption font-weight-bold bg-grey-lighten-4 px-2 py-1 rounded border text-grey-darken-3">
          {{ car.licensePlate }}
        </div>
      </div>

      <div class="d-flex flex-column ga-2">
        <div class="d-flex align-center text-body-2 text-grey-darken-3">
          <v-icon icon="mdi-speedometer" size="small" color="primary" class="mr-2"></v-icon>
          <span class="font-weight-medium">{{ formatKm(car.currentMileage) }} km</span>
        </div>
        
        <div class="d-flex align-center text-body-2 text-grey-darken-3" v-if="car.agency">
          <v-icon icon="mdi-map-marker" size="small" color="error" class="mr-2"></v-icon>
          <span class="text-truncate font-weight-medium">
            {{ car.agency.city }} - {{ car.agency.state }}
          </span>
        </div>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4 bg-grey-lighten-5 d-flex align-center">
      <div>
        <span class="text-caption text-grey-darken-1 font-weight-bold text-uppercase">Diária</span>
        <div class="text-h6 font-weight-black text-primary">
          {{ formatCurrency(Number(car.dailyRate)) }}
        </div>
      </div>
      
      <v-spacer></v-spacer>
      
      <v-btn 
        variant="tonal" 
        color="primary" 
        class="font-weight-bold px-4"
        rounded="lg"
        append-icon="mdi-arrow-right"
      >
        {{ car.status === 'AVAILABLE' ? 'Reservar' : 'Detalhes' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>