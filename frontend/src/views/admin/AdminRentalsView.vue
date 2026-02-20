<script setup lang="ts">
import { watch, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRentals } from '@/composables/useRentals';
import { useRentalsTable } from '@/composables/useRentalsTable';
import { useFormatters } from '@/composables/useFormatters';
import RentalDetailsExpanded from '@/components/RentalDetailsExpanded.vue';
import FinalizeRentalDialog from '@/components/FinalizeRentalDialog.vue';
import { RentalStatus } from '@/types/Rental';

const route = useRoute();

const { rentals, loading, totalItems, filters, fetchRentals, checkIn, finalizeRental, cancelRental, isLate } = useRentals();
const { formatRentalStatus, getRentalStatusColor } = useFormatters();
const { headers, statusOptions, itemsPerPage, currentPage, expanded, search } = useRentalsTable();

const showFinalizeDialog = ref(false);
const rentalToFinalize = ref<any>(null);
const confirmLoading = ref(false);
const processingId = ref<string | null>(null);

onMounted(() => {
  if (route.query.userId || route.query.search) {
    if (route.query.userId) filters.value.userId = route.query.userId as string;
    
    if (route.query.search) {
      search.value = route.query.search as string;
      filters.value.search = route.query.search as string;
    }
  }
});

const handleTableUpdate = async ({ page, itemsPerPage, sortBy }: any) => {
  currentPage.value = page;
  await fetchRentals({ page, itemsPerPage, sortBy });
};

watch(() => filters.value.status, () => {
  currentPage.value = 1;
  fetchRentals({ page: 1, itemsPerPage: itemsPerPage.value });
});

let searchTimeout: any = null;
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (!search.value) filters.value.userId = null;
    filters.value.search = search.value;
    currentPage.value = 1;
    fetchRentals({ page: 1, itemsPerPage: itemsPerPage.value });
  }, 600);
};


const handleCancel = async (rental: any) => {
  if (!confirm(`Tem certeza que deseja CANCELAR a reserva de ${rental.user?.name}? Esta ação não pode ser desfeita.`)) return;
  
  processingId.value = rental.id;
  try {
    await cancelRental(rental.id);
  } finally {
    processingId.value = null;
  }
};

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
      // CORREÇÃO: Usando o Enum ao invés da string 'COMPLETED'
      status: RentalStatus.COMPLETED,
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
    <div class="d-flex justify-space-between align-center mb-6">
       <h1 class="text-h4 font-weight-black text-black">Gestão de Reservas</h1>
       <v-btn 
          v-if="filters.userId" 
          color="error" 
          variant="tonal" 
          class="font-weight-black"
          prepend-icon="mdi-filter-remove"
          @click="() => { search = ''; filters.userId = null; onSearchInput() }"
        >
          Remover Filtro de Usuário
        </v-btn>
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
              bg-color="grey-lighten-5"
              clearable
              class="font-weight-bold text-black"
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
              bg-color="grey-lighten-5"
              class="font-weight-bold text-black"
              @input="onSearchInput"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="3">
             <v-btn 
                color="black" 
                variant="flat" 
                class="font-weight-black text-white w-100"
                prepend-icon="mdi-refresh"
                @click="fetchRentals({ page: currentPage, itemsPerPage })"
             >
                ATUALIZAR
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
           <v-avatar color="grey-lighten-3" size="36" class="mr-3 border">
             <span class="font-weight-black text-black text-body-2">{{ item.user?.name?.charAt(0) || '?' }}</span>
           </v-avatar>
           <div style="max-width: 180px;">
             <div class="font-weight-black text-body-2 text-black text-truncate" :title="item.user?.name">
               {{ item.user?.name || '---' }}
             </div>
             <div class="text-caption font-weight-bold text-grey-darken-2 text-truncate" :title="item.user?.email">
               {{ item.user?.email }}
             </div>
           </div>
        </div>
      </template>

      <template v-slot:item.car.model="{ item }">
         <div class="font-weight-black text-black text-truncate" :title="item.car?.model">
            {{ item.car?.model || '---' }}
         </div>
         <v-chip size="x-small" variant="flat" color="black" class="font-weight-black mt-1">
            {{ item.car?.licensePlate || '---' }}
         </v-chip>
      </template>

      <template v-slot:item.startDate="{ item }">
         <div class="d-flex flex-column">
             <span class="text-body-2 font-weight-black text-black">
                {{ new Date(item.startDate).toLocaleDateString('pt-BR') }}
             </span>
             <span class="text-caption font-weight-bold text-grey-darken-2">
                {{ new Date(item.startDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}
             </span>
         </div>
      </template>

      <template v-slot:item.endDate="{ item }">
        <div class="d-flex flex-column">
             <span class="text-body-2 font-weight-black" :class="isLate(item) ? 'text-red-darken-4' : 'text-black'">
                {{ new Date(item.endDate).toLocaleDateString('pt-BR') }}
             </span>
             <div class="d-flex align-center">
                <span class="text-caption font-weight-bold text-grey-darken-2">
                    {{ new Date(item.endDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}
                </span>
                <v-tooltip location="top" v-if="isLate(item)">
                    <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" icon="mdi-alert-circle" color="error" size="small" class="ml-1"></v-icon>
                    </template>
                    <span class="font-weight-bold">Devolução atrasada!</span>
                </v-tooltip>
             </div>
         </div>
      </template>

      <template v-slot:item.pickupAgency.name="{ item }">
         <div class="d-flex flex-column" style="max-width: 180px;">
             <span class="text-body-2 font-weight-black text-black text-truncate" :title="item.pickupAgency?.name">
                {{ item.pickupAgency?.name || '---' }}
             </span>
             <span class="text-caption font-weight-bold text-grey-darken-2 text-truncate">
                {{ item.pickupAgency?.city }} - {{ item.pickupAgency?.state }}
             </span>
         </div>
      </template>

      <template v-slot:item.returnAgency.name="{ item }">
         <div class="d-flex flex-column" style="max-width: 180px;">
             <span class="text-body-2 font-weight-black text-black text-truncate" :title="item.returnAgency?.name">
                {{ item.returnAgency?.name || '---' }}
             </span>
             <span class="text-caption font-weight-bold text-grey-darken-2 text-truncate">
                {{ item.returnAgency?.city }} - {{ item.returnAgency?.state }}
             </span>
         </div>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getRentalStatusColor(item.status)"
          size="small"
          variant="flat"
          class="font-weight-black text-uppercase"
        >
          {{ formatRentalStatus(item.status) }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
         <div class="d-flex justify-end gap-2">
            <v-btn 
              v-if="item.status === 'CONFIRMED'" 
              color="error" 
              size="small" 
              variant="tonal" 
              class="font-weight-black px-4"
              :loading="processingId === item.id" 
              @click.stop="handleCancel(item)"
            >
              CANCELAR
            </v-btn>

            <v-btn 
              v-if="item.status === 'CONFIRMED'" 
              color="success" 
              size="small" 
              variant="flat" 
              class="font-weight-black px-4"
              :loading="processingId === item.id" 
              @click.stop="handleCheckIn(item)"
            >
              ENTREGAR VEÍCULO
            </v-btn>
            <v-btn 
              v-if="item.status === 'ACTIVE'" 
              color="primary" 
              size="small" 
              variant="flat" 
              class="font-weight-black px-4"
              @click.stop="openFinalize(item)"
            >
              RECEBER VEÍCULO
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