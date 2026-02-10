<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCars } from '@/composables/useCars';
import { useAuthStore } from '@/stores/auth';
import type { Car } from '@/types/Car';

import CarCard from '@/components/CarCard.vue';
import CarFormDialog from '@/components/CarFormDialog.vue'; 

const { 
  cars, 
  loading, 
  page, 
  itemsPerPage, 
  totalItems, 
  search, 
  fetchCars 
} = useCars();

const authStore = useAuthStore();

const isDialogOpen = ref(false);
const carToEdit = ref<Car | null>(null);
let searchTimeout: ReturnType<typeof setTimeout>;

const pageCount = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const hasCars = computed(() => cars.value.length > 0);

const handleEditCar = (car: Car) => {
  if (authStore.isAdmin || authStore.isManager) {
    carToEdit.value = car;
    isDialogOpen.value = true;
  }
};

const handleReserve = (carId: string) => {
  console.log('Solicitação de reserva para:', carId);
  alert('Funcionalidade de Reserva em desenvolvimento!');
};

const onCarSaved = () => {
  fetchCars();
  isDialogOpen.value = false;
};

watch(page, () => {
  fetchCars();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

watch(search, (newVal) => {
  clearTimeout(searchTimeout);
  
  // Reseta para página 1 ao buscar
  if (page.value !== 1) page.value = 1;

  searchTimeout = setTimeout(() => {
    fetchCars();
  }, 500);
});

// Inicialização
onMounted(() => {
  fetchCars();
});
</script>

<template>
  <v-container fluid class="fill-height align-start pa-0 bg-grey-lighten-5">
    
    <v-toolbar color="white" elevation="1" class="px-md-8 pt-2 pb-2" extended extension-height="80">
      <div>
        <v-toolbar-title class="text-h5 font-weight-black text-grey-darken-4">
          Nossa Frota
        </v-toolbar-title>
        <p class="text-caption text-grey ml-4 mt-n1 hidden-sm-and-down">
          Escolha o veículo ideal para sua viagem
        </p>
      </div>

      <v-spacer></v-spacer>

      <v-btn 
        v-if="authStore.isAdmin"
        prepend-icon="mdi-plus" 
        color="primary" 
        variant="flat" 
        class="font-weight-bold mr-4"
        @click="(carToEdit = null), (isDialogOpen = true)"
      >
        Novo Veículo
      </v-btn>

      <template v-slot:extension>
        <v-container class="pa-0 px-4 px-md-0">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por modelo, marca ou placa..."
            variant="outlined"
            density="comfortable"
            hide-details
            bg-color="white"
            class="elevation-0 rounded-lg"
            max-width="600"
            clearable
          >
            <template v-slot:append-inner v-if="loading">
              <v-progress-circular indeterminate size="20" width="2" color="primary"></v-progress-circular>
            </template>
          </v-text-field>
        </v-container>
      </template>
    </v-toolbar>

    <v-container class="py-8 px-4 px-md-8">
      
      <v-row v-if="loading && !hasCars">
        <v-col cols="12" sm="6" md="4" lg="3" v-for="n in 4" :key="n">
          <v-skeleton-loader type="image, article" class="rounded-lg border bg-white" elevation="0"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else-if="!loading && !hasCars" class="mt-8">
        <v-col cols="12" class="text-center">
          <div class="d-inline-flex pa-6 bg-white rounded-circle mb-4 elevation-1">
            <v-icon icon="mdi-car-off" size="48" color="grey"></v-icon>
          </div>
          <h3 class="text-h6 text-grey-darken-2 font-weight-bold">Nenhum veículo encontrado</h3>
          <p class="text-body-2 text-grey">Tente ajustar sua busca.</p>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col 
          v-for="car in cars" 
          :key="car.id" 
          cols="12" sm="6" md="4" lg="3" xl="2"
        >
          <CarCard 
            :car="car" 
            @edit="handleEditCar" 
            @reserve="handleReserve"
          />
        </v-col>
      </v-row>

      <v-row v-if="pageCount > 1" class="mt-8">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="pageCount"
            color="primary"
            active-color="primary"
            rounded="circle"
            total-visible="5"
            :disabled="loading"
          ></v-pagination>
        </v-col>
      </v-row>

      <CarFormDialog 
        v-model="isDialogOpen" 
        :car-to-edit="carToEdit" 
        @saved="onCarSaved" 
      />

    </v-container>
  </v-container>
</template>