<template>
  <v-card 
    class="mx-auto h-100 d-flex flex-column transition-swing" 
    elevation="2" 
    hover 
    border
    @click="handleCardClick"
  >
    <v-img
      :src="car.imageUrl || 'https://cdn.vuetifyjs.com/images/cards/road.jpg'"
      height="200"
      cover
      class="align-end bg-grey-lighten-2"
    >
      <v-card-title class="text-white font-weight-bold text-shadow px-4 pb-4" style="background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))">
        {{ car.brand }} {{ car.model }}
      </v-card-title>
    </v-img>

    <v-card-text class="pt-4 flex-grow-1">
      <div class="d-flex justify-space-between align-center mb-4">
        <v-chip
          :color="statusColors[car.status]"
          size="small"
          label
          class="font-weight-bold text-uppercase"
        >
          {{ statusTranslation[car.status] }}
        </v-chip>
        <span class="text-caption text-grey-darken-1 border px-2 py-1 rounded font-weight-medium bg-grey-lighten-4">
          {{ car.licensePlate }}
        </span>
      </div>

      <div class="d-flex flex-column gap-2 mt-2">
        <div class="d-flex align-center text-body-2 text-grey-darken-2">
          <v-icon icon="mdi-speedometer" size="small" class="mr-2" color="primary"></v-icon>
          <span class="font-weight-medium">{{ formatNumber(car.currentMileage) }} km</span>
        </div>
        
        <div class="d-flex align-center text-body-2 text-grey-darken-2 mt-1" v-if="car.agency">
          <v-icon icon="mdi-map-marker" size="small" class="mr-2" color="error"></v-icon>
          <span class="text-truncate">{{ car.agency.city }} - {{ car.agency.state }}</span>
        </div>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4 bg-grey-lighten-5 align-center">
      <div>
        <span class="text-caption text-grey font-weight-medium">Diária</span>
        <div class="text-h6 font-weight-black text-primary line-height-1">
          {{ formatCurrency(Number(car.dailyRate)) }}
        </div>
      </div>
      
      <v-spacer></v-spacer>
      
      <v-btn 
        v-if="canEdit"
        icon="mdi-pencil"
        variant="tonal" 
        color="info" 
        size="small"
        class="mr-2"
        @click.stop="$emit('edit', car)"
      ></v-btn>

      <v-btn 
        v-if="canReserve"
        variant="flat" 
        color="primary" 
        class="font-weight-bold px-4"
        @click.stop="$emit('reserve', car.id)"
      >
        Reservar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { CarStatus } from '@/types/Car';
import type { Car } from '@/types/Car';
import { useFormatters } from '@/composables/useFormatters';

const props = defineProps<{
  car: Car
}>();

const emit = defineEmits(['reserve', 'edit']);

const authStore = useAuthStore();
const { formatCurrency } = useFormatters();

const canEdit = computed(() => authStore.isAdmin || authStore.isManager);

const canReserve = computed(() => {
  return props.car.status === CarStatus.AVAILABLE && !authStore.isAdmin;
});

const handleCardClick = () => {
  if (canEdit.value) {
    emit('edit', props.car);
  }
};

// Formatações Visuais
const statusColors: Record<CarStatus, string> = {
  [CarStatus.AVAILABLE]: 'success',
  [CarStatus.RENTED]: 'warning',
  [CarStatus.MAINTENANCE]: 'error',
};

const statusTranslation: Record<CarStatus, string> = {
  [CarStatus.AVAILABLE]: 'Disponível',
  [CarStatus.RENTED]: 'Alugado',
  [CarStatus.MAINTENANCE]: 'Manutenção',
};

const formatNumber = (val: number) =>
  new Intl.NumberFormat('pt-BR').format(val);
</script>

<style scoped>
.text-shadow {
  text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
}
.line-height-1 {
  line-height: 1;
}
</style>