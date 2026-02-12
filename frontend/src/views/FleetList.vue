<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCars } from '@/composables/useCars';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import type { Car } from '@/types/Car';

import CarCard from '@/components/CarCard.vue';
import CarFormDialog from '@/components/CarFormDialog.vue'; 

const route = useRoute();
const authStore = useAuthStore();
const appStore = useAppStore();
const { 
  cars, 
  loading, 
  error, 
  page, 
  itemsPerPage, 
  totalItems, 
  search, 
  agencyIdFilter,
  fetchCars 
} = useCars();

const isDialogOpen = ref(false);
const carToEdit = ref<Car | null>(null);
let searchTimeout: ReturnType<typeof setTimeout>;

itemsPerPage.value = 10;

const pageCount = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const hasCars = computed(() => Array.isArray(cars.value) && cars.value.length > 0);

const handleEditCar = (car: Car) => {
  if (authStore.isAdmin || authStore.isManager) {
    carToEdit.value = car;
    isDialogOpen.value = true;
  }
};

const handleReserve = (carId: string) => {
  appStore.notifyInfo(
    'Funcionalidade de reserva em desenvolvimento. Em breve você poderá agendar.'
  );
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
  if (page.value !== 1) page.value = 1;
  searchTimeout = setTimeout(() => {
    fetchCars();
  }, 500);
});

onMounted(() => {
  // 1. Verifica Busca de Texto
  if (route.query.search) {
    search.value = String(route.query.search);
  }

  // 2. Verifica Filtro de Agência
  if (route.query.agencyId) {
    agencyIdFilter.value = String(route.query.agencyId);
  } else {
    agencyIdFilter.value = null;
  }
  
  fetchCars();
});
</script>

<template>
  <v-container fluid class="fill-height align-start pa-0 bg-grey-lighten-5">
    
    <v-toolbar color="white" elevation="1" class="px-6 py-4" height="auto">
      <div class="d-flex flex-column justify-center fill-height w-100">
        
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex flex-column">
            <h1 class="text-h5 font-weight-black text-grey-darken-4 lh-1">
              {{ agencyIdFilter ? 'Frota da Agência' : 'Nossa Frota' }}
            </h1>
            <span class="text-body-2 text-grey mt-1">
              {{ agencyIdFilter ? 'Veículos disponíveis nesta unidade' : 'Escolha o veículo ideal para sua viagem' }}
            </span>
          </div>

          <v-btn 
            v-if="authStore.isAdmin"
            prepend-icon="mdi-plus" 
            color="primary" 
            variant="flat" 
            class="font-weight-bold ml-4"
            elevation="2"
            @click="(carToEdit = null), (isDialogOpen = true)"
          >
            Novo Veículo
          </v-btn>
        </div>

        <div class="mt-4 w-100" style="max-width: 800px;">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por modelo, marca ou placa..."
            variant="outlined"
            density="comfortable"
            hide-details
            bg-color="grey-lighten-5"
            base-color="grey-lighten-2"
            class="rounded-lg"
            clearable
          >
            <template v-slot:append-inner v-if="loading">
              <v-progress-circular indeterminate size="20" width="2" color="primary"></v-progress-circular>
            </template>
          </v-text-field>
        </div>

        <div v-if="agencyIdFilter" class="mt-2">
           <v-chip closable color="primary" label @click:close="agencyIdFilter = null; fetchCars();">
             Filtrando por Agência
           </v-chip>
        </div>

      </div>
    </v-toolbar>

    <v-container fluid class="py-8 px-6 px-md-10">
      
      <v-alert v-if="error" type="error" title="Erro ao carregar" :text="error" variant="tonal" class="mb-6">
        <template v-slot:append>
          <v-btn variant="text" @click="fetchCars">Tentar Novamente</v-btn>
        </template>
      </v-alert>

      <v-row v-if="loading && !hasCars">
        <v-col cols="12" sm="6" md="4" lg="3" class="v-col-xl-custom-5" v-for="n in 5" :key="n">
          <v-skeleton-loader type="image, article" class="rounded-lg border bg-white" elevation="0"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else-if="!loading && !hasCars && !error" class="mt-8">
        <v-col cols="12" class="text-center">
          <div class="d-inline-flex pa-6 bg-white rounded-circle mb-4 elevation-1">
            <v-icon icon="mdi-car-off" size="48" color="grey"></v-icon>
          </div>
          <h3 class="text-h6 text-grey-darken-2 font-weight-bold">Nenhum veículo encontrado</h3>
          <p class="text-body-2 text-grey">Tente ajustar seus filtros.</p>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col 
          v-for="car in cars" 
          :key="car.id" 
          cols="12" 
          sm="6" 
          md="4" 
          lg="3" 
          class="v-col-xl-custom-5"
        >
          <CarCard 
            :car="car" 
            class="h-100"
            @edit="handleEditCar" 
            @reserve="handleReserve"
          />
        </v-col>
      </v-row>

      <v-row v-if="pageCount > 1" class="mt-10">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="pageCount"
            color="primary"
            active-color="primary"
            rounded="circle"
            total-visible="5"
            :disabled="loading"
            elevation="0"
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

<style scoped>
.lh-1 { line-height: 1; }
.h-100 { height: 100% !important; }
@media (min-width: 1920px) {
  .v-col-xl-custom-5 {
    flex: 0 0 20%;
    max-width: 20%;
  }
}
</style>