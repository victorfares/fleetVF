<script setup lang="ts">
import { onMounted } from 'vue';
import { useRentals } from '@/composables/useRentals';
import { useFormatters } from '@/composables/useFormatters';
import { useAuthStore } from '@/stores/auth';

const { rentals, loading, fetchRentals } = useRentals();
const { formatCurrency, formatDate, formatRentalStatus, getRentalStatusColor } = useFormatters();
const authStore = useAuthStore();

const formatAddress = (agency: any) => {
  if (!agency) return 'Endereço não disponível';
  return `${agency.address}, ${agency.city} - ${agency.state}`;
};

onMounted(() => {
  if (authStore.user) {
    fetchRentals({ limit: 100 }); 
  }
});
</script>

<template>
  <v-container class="py-10">
    <h1 class="text-h4 font-weight-bold mb-8 text-black">Meus Aluguéis</h1>

    <v-row v-if="loading">
      <v-col v-for="n in 3" :key="n" cols="12">
        <v-skeleton-loader type="image, article" class="rounded-xl border"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-else-if="!rentals.length">
      <v-col cols="12" class="text-center py-16">
        <v-icon icon="mdi-car-off" size="64" color="grey" class="mb-4"></v-icon>
        <h3 class="text-h6 text-grey-darken-1">Você ainda não tem reservas.</h3>
        <v-btn color="black" to="/frota" class="mt-6 font-weight-bold" size="large" variant="flat">
          Alugar um Carro
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-else class="ga-6">
      <v-col v-for="rental in rentals" :key="rental.id" cols="12" class="pa-0">
        
        <v-card elevation="6" class="rounded-xl overflow-hidden d-flex flex-column flex-md-row bg-white border">
          
          <v-img 
            :src="rental.car.imageUrl" 
            width="320" 
            min-width="320"
            height="auto" 
            min-height="280"
            cover 
            class="bg-grey-lighten-4 flex-grow-0 d-none d-md-block"
          ></v-img>
          
          <v-img 
            :src="rental.car.imageUrl" 
            height="220" 
            cover 
            class="bg-grey-lighten-4 d-md-none"
          ></v-img>

          <div class="d-flex flex-column flex-grow-1">
            
            <div class="d-flex justify-space-between align-start pa-6 pa-md-8 border-b">
              <div>
                <h3 class="text-h5 font-weight-black text-black mb-1">
                  {{ rental.car.brand }} {{ rental.car.model }}
                </h3>
                <div class="d-flex align-center text-grey-darken-3 font-weight-medium">
                  <v-icon icon="mdi-card-account-details-outline" size="small" class="mr-2"></v-icon>
                  Placa: {{ rental.car.licensePlate }}
                </div>
              </div>
              
              <v-chip 
                :color="getRentalStatusColor(rental.status)" 
                variant="flat" 
                class="font-weight-bold text-uppercase px-4"
                label
              >
                {{ formatRentalStatus(rental.status) }}
              </v-chip>
            </div>

            <div class="pa-6 pa-md-8 d-flex flex-column flex-md-row ga-8 flex-grow-1">
              
              <div class="flex-1-1">
                <div class="d-flex align-center mb-3">
                  <v-icon icon="mdi-calendar-arrow-right" color="black" class="mr-2"></v-icon>
                  <span class="text-caption font-weight-black text-uppercase text-grey-darken-1" style="letter-spacing: 1px;">
                    Data de Retirada
                  </span>
                </div>
                
                <div class="text-h5 font-weight-bold text-black mb-4">
                  {{ formatDate(rental.startDate) }}
                </div>
                
                <div class="d-flex align-start">
                  <v-icon icon="mdi-map-marker" color="error" class="mr-3 mt-1"></v-icon>
                  <div>
                    <div class="font-weight-bold text-body-1 text-black mb-1">
                      {{ rental.pickupAgency.name }}
                    </div>
                    <div class="text-body-2 text-grey-darken-3 font-weight-medium" style="line-height: 1.4;">
                      {{ formatAddress(rental.pickupAgency) }}
                    </div>
                  </div>
                </div>
              </div>

              <v-divider vertical class="d-none d-md-block mx-4 border-opacity-25"></v-divider>
              <v-divider class="d-md-none border-opacity-25 my-4"></v-divider>

              <div class="flex-1-1">
                <div class="d-flex align-center mb-3">
                  <v-icon icon="mdi-calendar-arrow-left" color="black" class="mr-2"></v-icon>
                  <span class="text-caption font-weight-black text-uppercase text-grey-darken-1" style="letter-spacing: 1px;">
                    Previsão de Entrega
                  </span>
                </div>

                <div class="text-h5 font-weight-bold text-black mb-4">
                   {{ formatDate(rental.endDate) }}
                </div>

                <div class="d-flex align-start">
                  <v-icon icon="mdi-map-marker-check" color="success" class="mr-3 mt-1"></v-icon>
                  <div>
                    <div class="font-weight-bold text-body-1 text-black mb-1">
                      {{ rental.returnAgency.name }}
                    </div>
                    <div class="text-body-2 text-grey-darken-3 font-weight-medium" style="line-height: 1.4;">
                      {{ formatAddress(rental.returnAgency) }}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <v-sheet color="grey-lighten-4" class="px-6 px-md-8 py-5 d-flex align-center justify-space-between mt-auto border-t">
              <span class="text-body-1 font-weight-bold text-grey-darken-3">Valor Total Estimado</span>
              <span class="text-h5 font-weight-black text-black">
                {{ formatCurrency(Number(rental.totalValue)) }}
              </span>
            </v-sheet>

          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.flex-1-1 {
  flex: 1 1 0;
}
</style>