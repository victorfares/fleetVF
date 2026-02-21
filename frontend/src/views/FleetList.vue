<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCars } from '@/composables/useCars';
import { useAuthStore } from '@/stores/auth';
import type { Car } from '@/types/Car';

import CarCard from '@/components/CarCard.vue';
import CarFormDialog from '@/components/CarFormDialog.vue';
import RentalBookingDialog from '@/components/RentalBookingDialog.vue';

const route = useRoute();
const authStore = useAuthStore();

const {
  cars,
  loading,
  error,
  page,
  itemsPerPage,
  totalItems,
  search,
  agencyIdFilter,
  minPrice,
  maxPrice,
  clearFilters,
  fetchCars
} = useCars();

const isFormDialogOpen = ref(false);
const carToEdit = ref<Car | null>(null);

const isRentDialogOpen = ref(false);
const selectedCarForRent = ref<Car | null>(null);

let searchTimeout: ReturnType<typeof setTimeout>;
let priceTimeout: ReturnType<typeof setTimeout>;

const priceRange = ref([0, 2000]);

itemsPerPage.value = 10;

const pageCount = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const hasCars = computed(() => Array.isArray(cars.value) && cars.value.length > 0);

const handleEditCar = (car: Car) => {
  if (authStore.isAdmin || authStore.isManager) {
    carToEdit.value = car;
    isFormDialogOpen.value = true;
  }
};

const handleReserve = (car: Car) => {
  selectedCarForRent.value = car;
  isRentDialogOpen.value = true;
};

const onCarSaved = () => {
  fetchCars();
  isFormDialogOpen.value = false;
};

const onRentalSuccess = () => {
  fetchCars();
};

const handleClearPriceFilter = () => {
  priceRange.value = [0, 2000];
  minPrice.value = null;
  maxPrice.value = null;
  fetchCars();
};

const handleClearAllFilters = () => {
  priceRange.value = [0, 2000];
  clearFilters();
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

watch(priceRange, (newVal) => {
  clearTimeout(priceTimeout);
  priceTimeout = setTimeout(() => {
    if (page.value !== 1) page.value = 1;
    minPrice.value = newVal[0] ?? null;
    maxPrice.value = newVal[1] ?? null;
    fetchCars();
  }, 600);
}, { deep: true });

onMounted(() => {
  if (route.query.search) {
    search.value = String(route.query.search);
  }

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
            <h1 class="text-h5 font-weight-black text-grey-darken-4 text-no-wrap">
              {{ agencyIdFilter ? 'Frota da Agência' : 'Nossa Frota' }}
            </h1>
            <span class="text-body-2 text-grey mt-1">
              {{ agencyIdFilter ? 'Veículos disponíveis nesta unidade' : 'Escolha o veículo ideal para sua viagem' }}
            </span>
          </div>

          <v-btn v-if="authStore.isAdmin" prepend-icon="mdi-plus" color="primary" variant="flat"
            class="font-weight-bold ml-4" elevation="2" @click="(carToEdit = null), (isFormDialogOpen = true)">
            Novo Veículo
          </v-btn>
        </div>

        <div class="mt-4 w-100" style="max-width: 800px;">
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Buscar por modelo ou marca"
            variant="outlined" density="comfortable" hide-details bg-color="grey-lighten-5" base-color="grey-lighten-2"
            class="rounded-lg" clearable>
            <template v-slot:append-inner v-if="loading">
              <v-progress-circular indeterminate size="20" width="2" color="primary"></v-progress-circular>
            </template>
          </v-text-field>

          <v-expansion-panels variant="accordion" class="mt-3" elevation="0">
            <v-expansion-panel class="bg-transparent border-0">
              <v-expansion-panel-title
                class="text-button text-primary font-weight-bold px-4 rounded-lg bg-blue-grey-lighten-5"
                expand-icon="mdi-chevron-down" collapse-icon="mdi-chevron-up">
                <v-icon icon="mdi-tune-variant" start class="mr-2"></v-icon>
                Exibir Filtros Avançados
              </v-expansion-panel-title>

              <v-expansion-panel-text class="px-0 pt-3 pb-0">
                <v-card variant="outlined" class="pa-5 rounded-lg bg-white border-grey-lighten-3">
                  <div class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-6 d-flex align-center">
                    <v-icon icon="mdi-cash-multiple" size="small" class="mr-2"></v-icon>
                    Faixa de Preço (Diária)
                  </div>

                  <v-range-slider v-model="priceRange" :max="2000" :min="0" :step="50" color="primary"
                    thumb-label="always" hide-details class="align-center" strict>
                    <template v-slot:thumb-label="{ modelValue }">
                      <span class="text-white font-weight-bold text-caption">
                        {{ modelValue }}
                      </span>
                    </template>

                    <template v-slot:prepend>
                      <v-text-field v-model.number="priceRange[0]" hide-details single-line type="number"
                        variant="outlined" density="compact" style="width: 120px" prefix="R$"
                        class="mr-2 font-weight-bold text-grey-darken-4" base-color="grey-darken-2"></v-text-field>
                    </template>

                    <template v-slot:append>
                      <v-text-field v-model.number="priceRange[1]" hide-details single-line type="number"
                        variant="outlined" density="compact" style="width: 120px" prefix="R$"
                        class="ml-2 font-weight-bold text-grey-darken-4" base-color="grey-darken-2"></v-text-field>
                    </template>
                  </v-range-slider>

                  <div class="d-flex justify-end mt-4">
                    <v-btn variant="text" color="grey-darken-2" size="small" class="font-weight-bold"
                      @click="handleClearAllFilters">Limpar Todos</v-btn>
                  </div>
                </v-card>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>

        <div class="mt-4 d-flex flex-wrap align-center">

          <v-chip v-if="search" closable color="info" variant="tonal" class="mr-2 mb-2 font-weight-medium"
            @click:close="search = ''">
            <v-icon icon="mdi-magnify" start size="small"></v-icon>
            Busca: "{{ search }}"
          </v-chip>

          <v-chip v-if="agencyIdFilter" closable color="primary" variant="tonal" class="mr-2 mb-2 font-weight-medium"
            @click:close="agencyIdFilter = null; fetchCars();">
            <v-icon icon="mdi-map-marker" start size="small"></v-icon>
            Agência Específica
          </v-chip>

          <v-chip v-if="minPrice !== null || maxPrice !== null" closable color="success" variant="tonal"
            class="mr-2 mb-2 font-weight-medium" @click:close="handleClearPriceFilter">
            <v-icon icon="mdi-tag" start size="small"></v-icon>
            R$ {{ minPrice || 0 }} até R$ {{ maxPrice || '2000' }}
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
        <v-col cols="12" sm="6" md="4" lg="3" xl="2" v-for="n in 5" :key="n">
          <v-skeleton-loader type="image, article" class="rounded-lg border bg-white" elevation="0"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else-if="!loading && !hasCars && !error" class="mt-8">
        <v-col cols="12" class="text-center">
          <div class="d-inline-flex pa-6 bg-white rounded-circle mb-4 elevation-1">
            <v-icon icon="mdi-car-off" size="48" color="grey"></v-icon>
          </div>
          <h3 class="text-h6 text-grey-darken-2 font-weight-bold">Nenhum veículo encontrado</h3>
          <p class="text-body-2 text-grey">Tente ajustar seus filtros de preço ou busca.</p>
          <v-btn color="primary" variant="outlined" class="mt-4" @click="handleClearAllFilters">Limpar Filtros</v-btn>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="car in cars" :key="car.id" cols="12" sm="6" md="4" lg="3" xl="2">
          <CarCard :car="car" class="h-100" @edit="handleEditCar" @reserve="handleReserve(car)" />
        </v-col>
      </v-row>

      <v-row v-if="pageCount > 1" class="mt-10">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination v-model="page" :length="pageCount" color="primary" active-color="primary" rounded="circle"
            total-visible="5" :disabled="loading" elevation="0"></v-pagination>
        </v-col>
      </v-row>

      <CarFormDialog v-model="isFormDialogOpen" :car-to-edit="carToEdit" @saved="onCarSaved" />

      <RentalBookingDialog v-model="isRentDialogOpen" :car="selectedCarForRent" @success="onRentalSuccess" />

    </v-container>
  </v-container>
</template>