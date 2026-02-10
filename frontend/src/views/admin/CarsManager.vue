<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCars } from '@/composables/useCars';
import { CarStatus } from '@/types/Car';
import type { Car } from '@/types/Car';

import CarFormDialog from '@/components/CarFormDialog.vue';

const { 
  cars, 
  loading, 
  totalItems, 
  page, 
  itemsPerPage, 
  search, 
  fetchCars, 
  deleteCar 
} = useCars();

const isDialogOpen = ref(false);
const carToEdit = ref<Car | null>(null);
const deleteLoading = ref<string | null>(null);

const headers = [
  { title: 'Modelo / Marca', key: 'model', align: 'start' },
  { title: 'Placa', key: 'licensePlate' },
  { title: 'Agência', key: 'agency.name', sortable: false },
  { title: 'Diária', key: 'dailyRate', align: 'end' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end' },
] as const;

// 4. Ações
const openNewCar = () => {
  carToEdit.value = null;
  isDialogOpen.value = true;
};

const openEditCar = (car: Car) => {
  carToEdit.value = car;
  isDialogOpen.value = true;
};

const handleDelete = async (car: Car) => {
  if (!confirm(`Tem certeza que deseja excluir o ${car.brand} ${car.model} (${car.licensePlate})?`)) return;

  deleteLoading.value = car.id;
  try {
    await deleteCar(car.id);
  } catch (error) {
    alert('Erro ao excluir veículo.');
  } finally {
    deleteLoading.value = null;
  }
};

const onCarSaved = () => {
  fetchCars(); // Recarrega a tabela
  isDialogOpen.value = false;
};

watch([page, itemsPerPage], () => {
  fetchCars();
});

let searchTimeout: ReturnType<typeof setTimeout>;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1; // Volta pra primeira página ao buscar
    fetchCars();
  }, 600);
});

// Helpers Visuais
const getStatusColor = (status: CarStatus) => {
  switch (status) {
    case CarStatus.AVAILABLE: return 'success';
    case CarStatus.RENTED: return 'info';
    case CarStatus.MAINTENANCE: return 'error';
    default: return 'grey';
  }
};

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// Carga Inicial
fetchCars();
</script>

<template>
  <v-container fluid class="fill-height align-start pa-0 bg-grey-lighten-5">
    <v-container class="pa-4 pa-md-8">
      
      <div class="d-flex flex-wrap justify-space-between align-center mb-6 gap-4">
        <div>
          <h1 class="text-h4 font-weight-black text-grey-darken-4">Gestão de Frota</h1>
          <p class="text-body-2 text-grey">Administre os veículos, preços e disponibilidade.</p>
        </div>
        <v-btn 
          color="black" 
          prepend-icon="mdi-plus" 
          size="large" 
          elevation="2"
          class="font-weight-bold"
          @click="openNewCar"
        >
          Novo Veículo
        </v-btn>
      </div>

      <v-card elevation="1" rounded="lg" class="border">
        
        <v-card-title class="d-flex align-center py-4 px-6">
          <v-icon icon="mdi-car-multiple" class="mr-2 text-grey"></v-icon>
          <span class="text-subtitle-1 font-weight-bold">Veículos Cadastrados</span>
          
          <v-spacer></v-spacer>
          
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            label="Buscar veículo..."
            prepend-inner-icon="mdi-magnify"
            single-line
            hide-details
            class="max-width-300"
            style="max-width: 300px"
          ></v-text-field>
        </v-card-title>

        <v-divider></v-divider>

        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="headers"
          :items="cars"
          :items-length="totalItems"
          :loading="loading"
          item-value="id"
          hover
          class="rounded-0"
        >
          <template v-slot:item.model="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar rounded="lg" size="40" class="mr-3 border bg-grey-lighten-4">
                <v-img :src="item.imageUrl" cover icon="mdi-car"></v-img>
              </v-avatar>
              <div>
                <div class="font-weight-bold text-body-2">{{ item.brand }} {{ item.model }}</div>
                <div class="text-caption text-grey">{{ item.id.slice(0, 8) }}...</div>
              </div>
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              label
              class="font-weight-bold text-uppercase"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.dailyRate="{ item }">
            <span class="font-weight-medium text-grey-darken-3">
              {{ formatCurrency(Number(item.dailyRate)) }}
            </span>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="d-flex justify-end">
              <v-tooltip text="Editar" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn 
                    v-bind="props"
                    icon="mdi-pencil" 
                    variant="text" 
                    size="small" 
                    color="primary"
                    @click="openEditCar(item)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Excluir" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn 
                    v-bind="props"
                    icon="mdi-delete" 
                    variant="text" 
                    size="small" 
                    color="error"
                    :loading="deleteLoading === item.id"
                    @click="handleDelete(item)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>

          <template v-slot:no-data>
            <div class="pa-8 text-center">
              <v-icon icon="mdi-database-off" size="40" color="grey-lighten-1" class="mb-2"></v-icon>
              <p class="text-grey">Nenhum veículo encontrado.</p>
              <v-btn variant="text" color="primary" @click="openNewCar" class="mt-2">
                Cadastrar o primeiro
              </v-btn>
            </div>
          </template>

        </v-data-table-server>
      </v-card>
    </v-container>

    <CarFormDialog 
      v-model="isDialogOpen" 
      :car-to-edit="carToEdit" 
      @saved="onCarSaved" 
    />

  </v-container>
</template>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
</style>