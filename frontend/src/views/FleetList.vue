<template>
  <v-container fluid class="bg-grey-lighten-4 fill-height align-start pa-0">
    
    <v-toolbar color="white" elevation="1" class="px-md-8 pt-2 pb-2" extended extension-height="60">
      <v-toolbar-title class="text-h5 font-weight-bold text-primary">Nossa Frota</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-filter-variant" variant="text" color="grey-darken-1"></v-btn>
      <v-btn icon="mdi-view-grid" variant="text" color="primary"></v-btn>

      <template v-slot:extension>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar veículo..."
          variant="outlined"
          density="compact"
          hide-details
          single-line
          class="mb-2"
          bg-color="grey-lighten-5"
          rounded="lg"
          style="max-width: 600px; width: 100%;"
        ></v-text-field>
      </template>
    </v-toolbar>

    <v-container class="py-8 px-4 px-md-8">
      
      <v-row v-if="loading">
        <v-col cols="12" sm="6" md="4" lg="3" v-for="n in 8" :key="n">
          <v-skeleton-loader type="image, article" class="rounded-xl"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else-if="cars.length === 0">
        <v-col cols="12" class="text-center mt-10">
          <v-icon icon="mdi-car-off" size="64" color="grey-lighten-1"></v-icon>
          <h3 class="text-h6 text-grey mt-4">Nenhum veículo encontrado.</h3>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col 
          v-for="car in filteredCars" 
          :key="car.id" 
          cols="12" sm="6" md="4" lg="3" xl="2"
        >
          <CarCard :car="car" />
        </v-col>
      </v-row>

      <v-row v-if="pageCount > 1 && !search" class="mt-6">
        <v-col cols="12">
          <v-pagination
            v-model="page"
            :length="pageCount"
            color="primary"
            rounded="circle"
          ></v-pagination>
        </v-col>
      </v-row>

    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/services/api';
import CarCard from '@/components/CarCard.vue';
import type { Car } from '@/types/Car';
import { usePagination } from '@/composables/usePagination'; // Importe o composable

const cars = ref<Car[]>([]);
const loading = ref(true);
const search = ref('');

const { page, itemsPerPage, totalItems, pageCount, offset } = usePagination(8);

const filteredCars = computed(() => {
  if (!search.value) return cars.value;
  const term = search.value.toLowerCase();
  
  return cars.value.filter(car => 
    car.model.toLowerCase().includes(term) ||
    car.brand.toLowerCase().includes(term) ||
    car.licensePlate.toLowerCase().includes(term)
  );
});

const fetchCars = async () => {
  loading.value = true;
  try {
    const response = await api.get('/cars', {
      params: {
        limit: itemsPerPage.value,
        offset: offset.value
      }
    });
    
    const apiResponse = response.data.data; 
    cars.value = apiResponse.data;
    totalItems.value = apiResponse.count;

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    loading.value = false;
  }
};

// Observa mudança de página para buscar novos dados
watch(page, () => {
  fetchCars();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

watch(search, (newVal) => {
  if (newVal) {
  }
});

onMounted(() => {
  fetchCars();
});
</script>