<script setup lang="ts">
import { onMounted } from 'vue';
import { useRentals } from '@/composables/useRentals';

const { 
  rentals, 
  loading, 
  fetchRentals, 
  formatCurrency, 
  formatDate, 
  formatRentalStatus, 
  getRentalStatusColor 
} = useRentals();

onMounted(() => {
  fetchRentals();
});
</script>

<template>
  <v-container class="py-8">
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-black text-grey-darken-3">Meus Aluguéis</h1>
    </div>

    <v-row v-if="loading">
      <v-col v-for="n in 3" :key="n" cols="12">
        <v-skeleton-loader type="list-item-avatar-three-line" class="border rounded-lg"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-else-if="rentals.length === 0">
      <v-col cols="12" class="text-center mt-10">
        <v-icon icon="mdi-car-key" size="80" color="grey-lighten-2" class="mb-4"></v-icon>
        <h3 class="text-h6 text-grey-darken-1">Você ainda não tem reservas.</h3>
        <p class="text-body-2 text-grey mb-6">Que tal escolher o carro da sua próxima viagem?</p>
        <v-btn to="/frota" color="primary" variant="flat" size="large" class="font-weight-bold">
          Ver Carros Disponíveis
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="rental in rentals" :key="rental.id" cols="12">
        <v-card elevation="0" border class="rounded-lg overflow-hidden">
          <div class="d-flex flex-column flex-sm-row">
            
            <v-img
              :src="rental.car.imageUrl"
              width="240"
              height="160"
              cover
              class="bg-grey-lighten-4 hidden-xs"
            ></v-img>

            <div class="pa-4 flex-grow-1">
              <div class="d-flex justify-space-between align-start">
                <div>
                  <h3 class="text-h6 font-weight-bold text-grey-darken-3">
                    {{ rental.car.brand }} {{ rental.car.model }}
                  </h3>
                  <div class="text-caption font-weight-medium text-grey">
                    Placa: {{ rental.car.licensePlate }}
                  </div>
                </div>
                
                <v-chip 
                  :class="getRentalStatusColor(rental.status)" 
                  variant="flat" 
                  size="small" 
                  class="font-weight-bold"
                >
                  {{ formatRentalStatus(rental.status) }}
                </v-chip>
              </div>

              <v-divider class="my-3 border-opacity-50"></v-divider>

              <v-row dense class="text-body-2">
                <v-col cols="6" sm="4">
                  <div class="text-caption text-grey mb-1">Retirada</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-calendar-arrow-right" size="small" class="mr-2 text-primary"></v-icon>
                    <span class="font-weight-medium">{{ formatDate(rental.startDate) }}</span>
                  </div>
                  <div class="text-caption text-truncate">{{ rental.pickupAgency.name }}</div>
                </v-col>

                <v-col cols="6" sm="4">
                  <div class="text-caption text-grey mb-1">Devolução</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-calendar-arrow-left" size="small" class="mr-2 text-primary"></v-icon>
                    <span class="font-weight-medium">{{ formatDate(rental.endDate) }}</span>
                  </div>
                  <div class="text-caption text-truncate">{{ rental.returnAgency.name }}</div>
                </v-col>

                <v-col cols="12" sm="4" class="text-sm-right mt-2 mt-sm-0">
                  <div class="text-caption text-grey mb-1">Total Estimado</div>
                  <div class="text-h6 font-weight-bold text-primary">
                    {{ formatCurrency(rental.totalValue) }}
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>