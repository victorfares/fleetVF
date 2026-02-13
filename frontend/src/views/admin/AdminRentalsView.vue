<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRentals } from '@/composables/useRentals';
import { useFormatters } from '@/composables/useFormatters';

const { 
  rentals, 
  loading, 
  totalItems, 
  filters, 
  fetchRentals, 
  checkIn, 
  finalizeRental,
  isLate 
} = useRentals();

const { 
  formatCurrency, 
  formatDate, 
  formatRentalStatus, 
  getRentalStatusColor 
} = useFormatters();

// Configuração da Tabela
const itemsPerPage = ref(10);
const expanded = ref([]);

const headers = [
  { title: 'Cliente', key: 'user.name', sortable: false },
  { title: 'Veículo', key: 'car.model', sortable: false },
  { title: 'Retirada', key: 'startDate', sortable: true },
  { title: 'Devolução', key: 'endDate', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Valor Est.', key: 'totalValue', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end' },
];

const statusOptions = [
  { title: 'Todos', value: null },
  { title: 'Confirmados', value: 'CONFIRMED' },
  { title: 'Ativos (Em Andamento)', value: 'ACTIVE' },
  { title: 'Finalizados', value: 'COMPLETED' },
  { title: 'Cancelados', value: 'CANCELLED' },
];

// Dialogs
const showFinalizeDialog = ref(false);
const rentalToFinalize = ref<any>(null);
const endMileage = ref<number | null>(null);
const confirmLoading = ref(false);

// Ações
const handleTableUpdate = async ({ page, itemsPerPage, sortBy }: any) => {
  await fetchRentals({ page, itemsPerPage, sortBy });
};

watch(() => [filters.value.status, filters.value.search], () => {
  fetchRentals({ page: 1, itemsPerPage: itemsPerPage.value });
});

const handleCheckIn = async (rental: any) => {
  if (!confirm(`Confirmar entrega do veículo para ${rental.user.name}?`)) return;
  try {
    await checkIn(rental.id);
    fetchRentals({ page: 1, itemsPerPage: itemsPerPage.value });
  } catch (e) {
    alert('Erro ao realizar check-in');
  }
};

const openFinalize = (rental: any) => {
  rentalToFinalize.value = rental;
  endMileage.value = rental.car.currentMileage;
  showFinalizeDialog.value = true;
};

const handleFinalize = async () => {
  if (!rentalToFinalize.value || !endMileage.value) return;
  confirmLoading.value = true;
  try {
    await finalizeRental(rentalToFinalize.value.id, {
      status: 'COMPLETED',
      endMileage: Number(endMileage.value),
      realReturnDate: new Date().toISOString()
    });
    showFinalizeDialog.value = false;
    fetchRentals({ page: 1, itemsPerPage: itemsPerPage.value });
  } catch (error) {
  } finally {
    confirmLoading.value = false;
  }
};
</script>

<template>
  <v-container fluid class="py-8">
    
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-black text-black">Gestão de Reservas</h1>
    </div>

    <v-card class="mb-6 rounded-lg border bg-white" elevation="0">
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Filtrar por Status"
              variant="outlined"
              density="compact"
              hide-details
              bg-color="white"
              clearable
              color="primary"
              base-color="black"
            ></v-select>
          </v-col>

          <v-col cols="12" md="5">
            <v-text-field
              v-model="filters.search"
              label="Buscar por Cliente (Nome) ou Veículo (Placa)"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              bg-color="white"
              color="primary"
              base-color="black"
              @keyup.enter="fetchRentals({ page: 1, itemsPerPage })"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4" class="d-flex justify-end">
             <v-btn 
                color="black" 
                variant="flat" 
                class="font-weight-bold text-white"
                prepend-icon="mdi-filter"
                @click="fetchRentals({ page: 1, itemsPerPage })"
             >
                Aplicar Filtros
             </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:expanded="expanded"
      :headers="headers"
      :items="rentals"
      :items-length="totalItems"
      :loading="loading"
      item-value="id"
      show-expand
      hover
      class="rounded-xl border elevation-2"
      @update:options="handleTableUpdate"
    >
      <template v-slot:item.user.name="{ item }">
        <div class="d-flex align-center py-2">
           <v-avatar color="black" variant="tonal" size="32" class="mr-3 rounded-lg">
             <span class="font-weight-black text-black">{{ item.user.name.charAt(0) }}</span>
           </v-avatar>
           <div>
             <div class="font-weight-bold text-body-2 text-black">{{ item.user.name }}</div>
             <div class="text-caption text-grey-darken-3 font-weight-medium">{{ item.user.email }}</div>
           </div>
        </div>
      </template>

      <template v-slot:item.car.model="{ item }">
         <div class="font-weight-bold text-black">{{ item.car.model }}</div>
         <v-chip size="x-small" variant="outlined" color="black" class="font-weight-bold mt-1">
            {{ item.car.licensePlate }}
         </v-chip>
      </template>

      <template v-slot:item.startDate="{ item }">
         <span class="text-black font-weight-medium">{{ formatDate(item.startDate) }}</span>
      </template>

      <template v-slot:item.endDate="{ item }">
        <div 
          class="py-1 px-2 rounded" 
          :class="{'bg-red-lighten-5 text-red-darken-4 font-weight-black border border-error': isLate(item)}"
        >
          {{ formatDate(item.endDate) }}
          <v-tooltip location="top" v-if="isLate(item)">
            <template v-slot:activator="{ props }">
               <v-icon v-bind="props" icon="mdi-alert-circle" color="red-darken-4" class="ml-2"></v-icon>
            </template>
            <span class="font-weight-bold">Devolução atrasada! Multa será aplicada.</span>
          </v-tooltip>
        </div>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getRentalStatusColor(item.status)"
          size="small"
          label
          class="font-weight-black"
        >
          {{ formatRentalStatus(item.status) }}
        </v-chip>
      </template>

      <template v-slot:item.totalValue="{ item }">
        <span class="font-weight-black text-black">{{ formatCurrency(item.totalValue) }}</span>
      </template>

      <template v-slot:item.actions="{ item }">
         <v-btn 
            v-if="item.status === 'CONFIRMED'"
            size="small" 
            color="success" 
            variant="flat" 
            prepend-icon="mdi-key-variant"
            class="font-weight-bold text-white"
            @click="handleCheckIn(item)"
         >
            Entregar
         </v-btn>
         
         <v-btn 
            v-if="item.status === 'ACTIVE'"
            size="small" 
            color="primary" 
            variant="flat" 
            prepend-icon="mdi-flag-checkered"
            class="font-weight-bold"
            @click="openFinalize(item)"
         >
            Receber
         </v-btn>
      </template>

      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="bg-grey-lighten-4 pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="flat" class="bg-white h-100 border rounded-lg">
                  <v-card-title class="text-subtitle-1 font-weight-black text-black d-flex align-center pt-4">
                    <v-icon icon="mdi-map-marker-path" class="mr-3" color="black"></v-icon>
                    LOGÍSTICA
                  </v-card-title>
                  <v-divider class="my-2 border-opacity-25"></v-divider>
                  <v-card-text>
                    
                    <div class="d-flex align-start mb-4">
                       <v-icon icon="mdi-map-marker-radius" color="success" class="mr-3 mt-1"></v-icon>
                       <div>
                         <span class="text-caption text-grey-darken-1 font-weight-black text-uppercase d-block mb-1">Local de Retirada</span>
                         <div class="text-body-1 font-weight-bold text-black">{{ item.pickupAgency.name }}</div>
                         <div class="text-caption font-weight-medium text-grey-darken-3">{{ formatDate(item.startDate) }}</div>
                       </div>
                    </div>

                    <div class="d-flex align-start">
                       <v-icon icon="mdi-flag-checkered" color="error" class="mr-3 mt-1"></v-icon>
                       <div>
                         <span class="text-caption text-grey-darken-1 font-weight-black text-uppercase d-block mb-1">Local de Devolução</span>
                         <div class="text-body-1 font-weight-bold text-black">{{ item.returnAgency.name }}</div>
                         <div class="text-caption font-weight-medium text-grey-darken-3">{{ formatDate(item.endDate) }}</div>
                         
                         <div v-if="item.realReturnDate" class="mt-2">
                            <v-chip size="small" :color="isLate(item) ? 'error' : 'success'" variant="elevated" class="font-weight-bold">
                               Realizada: {{ formatDate(item.realReturnDate) }}
                            </v-chip>
                         </div>
                       </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="flat" class="bg-white h-100 border rounded-lg">
                  <v-card-title class="text-subtitle-1 font-weight-black text-black d-flex align-center pt-4">
                    <v-icon icon="mdi-cash-multiple" class="mr-3" color="black"></v-icon>
                    FINANCEIRO
                  </v-card-title>
                  <v-divider class="my-2 border-opacity-25"></v-divider>
                  <v-card-text>
                    <div class="d-flex justify-space-between mb-3 align-center">
                      <span class="text-body-2 text-grey-darken-3 font-weight-bold text-uppercase">Valor Diária (Base)</span>
                      <span class="text-body-1 font-weight-bold text-black">{{ formatCurrency(item.dailyRateSnapshot) }}</span>
                    </div>
                    
                    <div v-if="isLate(item)" class="d-flex justify-space-between mb-3 align-center py-2 px-3 bg-red-lighten-5 rounded border border-error">
                      <span class="text-caption font-weight-black text-uppercase text-red-darken-4">Status</span>
                      <span class="font-weight-black text-red-darken-4">MULTA POR ATRASO APLICÁVEL</span>
                    </div>

                    <v-divider class="my-4 border-dashed border-opacity-100"></v-divider>
                    
                    <div class="d-flex justify-space-between align-center">
                       <span class="text-h6 font-weight-black text-grey-darken-4">TOTAL FINAL</span>
                       <span class="text-h5 font-weight-black text-black">{{ formatCurrency(item.totalValue) }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </td>
        </tr>
      </template>

    </v-data-table-server>

    <v-dialog v-model="showFinalizeDialog" max-width="450">
      <v-card class="rounded-xl">
        <v-card-title class="bg-black text-white py-4 font-weight-bold d-flex align-center">
          <v-icon icon="mdi-flag-checkered" class="mr-3"></v-icon>
          Finalizar Locação
        </v-card-title>
        
        <v-card-text class="pt-6">
          <v-alert color="info" variant="tonal" density="compact" class="mb-6 rounded-lg font-weight-medium border-opacity-100" border="start">
             Confira o veículo antes de confirmar a quilometragem final.
          </v-alert>

          <v-text-field
            v-model="endMileage"
            label="Quilometragem Final (Hodômetro)"
            type="number"
            variant="outlined"
            density="comfortable"
            autofocus
            suffix="KM"
            color="black"
            base-color="black"
            class="font-weight-bold"
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showFinalizeDialog = false" color="grey-darken-3" class="font-weight-bold">Cancelar</v-btn>
          <v-btn 
             color="black" 
             variant="flat" 
             class="font-weight-bold px-6"
             :loading="confirmLoading" 
             @click="handleFinalize"
          >
            Confirmar Devolução
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>