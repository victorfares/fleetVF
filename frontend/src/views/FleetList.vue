<template>
  <v-container fluid class="bg-grey-lighten-5 fill-height align-start pa-0">
    
    <v-toolbar color="white" elevation="1" class="px-md-8 pt-2 pb-2" extended extension-height="80">
      <div>
        <v-toolbar-title class="text-h5 font-weight-black text-grey-darken-4">
          Gestão de Frota
        </v-toolbar-title>
        <p class="text-caption text-grey ml-4 mt-n1 hidden-sm-and-down">
          {{ totalItems }} veículos cadastrados
        </p>
      </div>

      <v-spacer></v-spacer>
      
      <v-btn 
        prepend-icon="mdi-plus" 
        color="black" 
        variant="flat" 
        height="44"
        class="font-weight-bold"
        @click="openNewCar"
      >
        Novo Carro
      </v-btn>

      <template v-slot:extension>
        <v-container class="pa-0 px-4 px-md-0">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por modelo, placa..."
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
      
      <v-row v-if="loading && cars.length === 0">
        <v-col cols="12" sm="6" md="4" lg="3" v-for="n in 4" :key="n">
          <v-skeleton-loader type="image, article" class="rounded-lg border bg-white" elevation="0"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else-if="cars.length === 0" class="mt-8">
        <v-col cols="12" class="text-center">
          <div class="d-inline-flex pa-6 bg-white rounded-circle mb-4 elevation-1">
            <v-icon icon="mdi-car-off" size="48" color="grey"></v-icon>
          </div>
          <h3 class="text-h6 text-grey-darken-2 font-weight-bold">Nenhum veículo encontrado</h3>
          <p class="text-body-2 text-grey">Tente ajustar sua busca ou adicione um novo carro.</p>
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
            @edit="openEditCar" 
            @reserve="openReserveModal"
          />
        </v-col>
      </v-row>

      <v-row v-if="pageCount > 1" class="mt-8">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="page"
            :length="pageCount"
            color="black"
            active-color="black"
            rounded="circle"
            total-visible="5"
          ></v-pagination>
        </v-col>
      </v-row>

      <CarFormDialog 
        v-model="isDialogOpen" 
        :car-to-edit="carToEdit" 
        @saved="fetchCars" 
      />

    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/services/api';
import CarCard from '@/components/CarCard.vue';
import CarFormDialog from '@/components/CarFormDialog.vue'; // 1. Importar o Dialog
import type { Car, CarResponse } from '@/types/Car';

// Estado da Lista
const cars = ref<Car[]>([]);
const loading = ref(false);
const totalItems = ref(0);
const itemsPerPage = ref(8);
const page = ref(1);
const searchQuery = ref('');

// Estado do Modal
const isDialogOpen = ref(false);      // Controla visibilidade
const carToEdit = ref<Car | null>(null); // Controla qual carro está sendo editado

// Controle de Debounce
let searchTimeout: ReturnType<typeof setTimeout>;

// Computados
const pageCount = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// Actions
const fetchCars = async () => {
  loading.value = true;
  const offset = (page.value - 1) * itemsPerPage.value;

  try {
    const response = await api.get('/cars', {
      params: {
        limit: itemsPerPage.value,
        offset: offset,
        search: searchQuery.value
      }
    });
    
    const apiResponse = response.data.data as CarResponse;
    cars.value = apiResponse.data;
    totalItems.value = apiResponse.count;

  } catch (error) {
    console.error('Erro ao buscar frota:', error);
  } finally {
    loading.value = false;
  }
};

// 2. Implementar lógica de abrir NOVO
const openNewCar = () => {
  carToEdit.value = null; // Limpa para garantir formulário vazio
  isDialogOpen.value = true;
};

// 3. Implementar lógica de abrir EDIÇÃO
const openEditCar = (car: Car) => {
  carToEdit.value = car; // Passa o carro clicado
  isDialogOpen.value = true;
};

const openReserveModal = (id: number) => {
  console.log('Reservar ID:', id);
  // Futuro: Implementar lógica de reserva
};

// Watchers
watch(page, () => {
  fetchCars();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  loading.value = true;
  
  searchTimeout = setTimeout(() => {
    page.value = 1; 
    fetchCars();
  }, 600);
});

onMounted(() => {
  fetchCars();
});
</script>