<script setup lang="ts">
import { watch, nextTick } from 'vue';
import { useRentals } from '@/composables/useRentals';
import { useRentalsTable } from '@/composables/useRentalsTable'; // <--- Novo import
import { useFormatters } from '@/composables/useFormatters';
import RentalDetailsExpanded from '@/components/RentalDetailsExpanded.vue';
import FinalizeRentalDialog from '@/components/FinalizeRentalDialog.vue';

// 1. Lógica de Negócio (API)
const { rentals, loading, totalItems, filters, fetchRentals, checkIn, finalizeRental, isLate } = useRentals();
const { formatCurrency, formatRentalStatus, getRentalStatusColor } = useFormatters();

// 2. Configuração da Tabela (Visual)
const { headers, statusOptions, itemsPerPage, currentPage, expanded, search } = useRentalsTable();

// 3. Estados Locais de Ação
import { ref } from 'vue'; // Import ref aqui se não estiver auto-importado
const showFinalizeDialog = ref(false);
const rentalToFinalize = ref<any>(null);
const confirmLoading = ref(false);
const processingId = ref<string | null>(null);

// --- Métodos de Controle ---

const handleTableUpdate = async ({ page, itemsPerPage, sortBy }: any) => {
  currentPage.value = page;
  await fetchRentals({ page, itemsPerPage, sortBy });
};

// Atualiza ao mudar filtro de status
watch(() => filters.value.status, () => {
  currentPage.value = 1;
  fetchRentals({ page: 1, itemsPerPage: itemsPerPage.value });
});

// Debounce da busca
let searchTimeout: any = null;
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.search = search.value; // Atualiza o filtro da API
    currentPage.value = 1;
    fetchRentals({ page: 1, itemsPerPage: itemsPerPage.value });
  }, 600);
};

// --- Ações de Negócio ---

const handleCheckIn = async (rental: any) => {
  if (!confirm(`Confirmar entrega para ${rental.user?.name}?`)) return;
  processingId.value = rental.id;
  try {
    await checkIn(rental.id);
    await fetchRentals({ page: currentPage.value, itemsPerPage: itemsPerPage.value });
  } finally {
    processingId.value = null;
  }
};

const openFinalize = (rental: any) => {
  rentalToFinalize.value = JSON.parse(JSON.stringify(rental));
  showFinalizeDialog.value = true;
};

const onFinalizeConfirm = async (mileage: number) => {
  confirmLoading.value = true;
  try {
    await finalizeRental(rentalToFinalize.value.id, {
      status: 'COMPLETED',
      endMileage: mileage,
      realReturnDate: new Date().toISOString()
    });
    showFinalizeDialog.value = false;
    expanded.value = [];
    await nextTick();
    await fetchRentals({ page: currentPage.value, itemsPerPage: itemsPerPage.value });
  } finally {
    confirmLoading.value = false;
    rentalToFinalize.value = null;
  }
};
</script>

<template>
  <v-container fluid class="py-8">
    <h1 class="text-h4 font-weight-black text-black mb-6">Gestão de Reservas</h1>

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

          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="Buscar por Cliente ou Placa"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              bg-color="white"
              color="primary"
              base-color="black"
              @input="onSearchInput"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="3">
             <v-btn 
                color="black" 
                variant="flat" 
                class="font-weight-bold text-white w-100"
                prepend-icon="mdi-refresh"
                @click="fetchRentals({ page: currentPage, itemsPerPage })"
             >
                Atualizar
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
      :loading="loading && !processingId"
      item-value="id"
      show-expand
      hover
      density="default"
      class="rounded-xl border elevation-2"
      @update:options="handleTableUpdate"
    >
      <template v-slot:item.user.name="{ item }">
        <div class="d-flex align-center py-2">
           <v-avatar color="grey-lighten-4" size="36" class="mr-3 border">
             <span class="font-weight-black text-black text-body-2">{{ item.user?.name?.charAt(0) || '?' }}</span>
           </v-avatar>
           <div style="max-width: 180px;">
             <div class="font-weight-bold text-body-2 text-black text-truncate" :title="item.user?.name">
               {{ item.user?.name || '---' }}
             </div>
             <div class="text-caption text-grey-darken-1 text-truncate" :title="item.user?.email">
               {{ item.user?.email }}
             </div>
           </div>
        </div>
      </template>

      <template v-slot:item.car.model="{ item }">
         <div class="font-weight-bold text-black text-truncate" :title="item.car?.model">
            {{ item.car?.model || '---' }}
         </div>
         <v-chip size="x-small" variant="outlined" color="grey-darken-4" class="font-weight-bold mt-1">
            {{ item.car?.licensePlate || '---' }}
         </v-chip>
      </template>

      <template v-slot:item.startDate="{ item }">
         <div class="d-flex flex-column">
             <span class="text-body-2 font-weight-bold text-black">
                {{ new Date(item.startDate).toLocaleDateString('pt-BR') }}
             </span>
             <span class="text-caption text-grey-darken-1">
                {{ new Date(item.startDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}
             </span>
         </div>
      </template>

      <template v-slot:item.endDate="{ item }">
        <div class="d-flex flex-column">
             <span class="text-body-2 font-weight-bold" :class="isLate(item) ? 'text-red-darken-3' : 'text-black'">
                {{ new Date(item.endDate).toLocaleDateString('pt-BR') }}
             </span>
             <div class="d-flex align-center">
                <span class="text-caption text-grey-darken-1">
                    {{ new Date(item.endDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}
                </span>
                <v-tooltip location="top" v-if="isLate(item)">
                    <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" icon="mdi-alert-circle" color="error" size="x-small" class="ml-1"></v-icon>
                    </template>
                    <span class="font-weight-bold">Devolução atrasada!</span>
                </v-tooltip>
             </div>
         </div>
      </template>

      <template v-slot:item.pickupAgency.name="{ item }">
         <div class="d-flex flex-column" style="max-width: 180px;">
             <span class="text-body-2 font-weight-bold text-black text-truncate" :title="item.pickupAgency?.name">
                {{ item.pickupAgency?.name || '---' }}
             </span>
             <span class="text-caption text-grey-darken-1 text-truncate">
                {{ item.pickupAgency?.city }} - {{ item.pickupAgency?.state }}
             </span>
         </div>
      </template>

      <template v-slot:item.returnAgency.name="{ item }">
         <div class="d-flex flex-column" style="max-width: 180px;">
             <span class="text-body-2 font-weight-bold text-black text-truncate" :title="item.returnAgency?.name">
                {{ item.returnAgency?.name || '---' }}
             </span>
             <span class="text-caption text-grey-darken-1 text-truncate">
                {{ item.returnAgency?.city }} - {{ item.returnAgency?.state }}
             </span>
         </div>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getRentalStatusColor(item.status)"
          size="small"
          label
          variant="tonal"
          class="font-weight-black text-uppercase"
        >
          {{ formatRentalStatus(item.status) }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
         <div class="d-flex justify-end">
            <v-btn 
              v-if="item.status === 'CONFIRMED'" 
              color="success" 
              size="small" 
              variant="flat" 
              class="font-weight-bold px-3"
              :loading="processingId === item.id" 
              @click.stop="handleCheckIn(item)"
            >
              Entregar
            </v-btn>
            <v-btn 
              v-if="item.status === 'ACTIVE'" 
              color="primary" 
              size="small" 
              variant="flat" 
              class="font-weight-bold px-3"
              @click.stop="openFinalize(item)"
            >
              Receber
            </v-btn>
         </div>
      </template>

      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="pa-0">
            <RentalDetailsExpanded :item="item" :is-late="isLate" />
          </td>
        </tr>
      </template>
    </v-data-table-server>

    <FinalizeRentalDialog 
      v-model="showFinalizeDialog" 
      :rental="rentalToFinalize" 
      :loading="confirmLoading"
      @confirm="onFinalizeConfirm"
    />
  </v-container>
</template>