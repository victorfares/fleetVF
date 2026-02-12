<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRentals } from '@/composables/useRentals';
import { useFormatters } from '@/composables/useFormatters';

const { 
  rentals, 
  loading, 
  fetchRentals, 
  checkIn, 
  finalizeRental,
  totalItems 
} = useRentals();

const { 
  formatCurrency, 
  formatDate, 
  formatRentalStatus, 
  getRentalStatusColor 
} = useFormatters();

const page = ref(1);
const itemsPerPage = ref(10);

const showFinalizeDialog = ref(false);
const rentalToFinalize = ref<any>(null);
const endMileage = ref<number | null>(null);
const confirmLoading = ref(false);

const loadData = () => {
  const offset = (page.value - 1) * itemsPerPage.value;
  fetchRentals({ limit: itemsPerPage.value, offset });
};

const handleCheckIn = async (rental: any) => {
  if (!confirm(`Confirmar retirada do veículo ${rental.car.model}?`)) return;
  await checkIn(rental.id);
  loadData(); 
};

const openFinalize = (rental: any) => {
  rentalToFinalize.value = rental;
  endMileage.value = rental.car.currentMileage; // Sugere a km atual
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
    loadData();
  } catch (error) {
  } finally {
    confirmLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <v-container fluid>
    <h1 class="text-h4 mb-6">Gestão de Reservas</h1>

    <v-data-table-server
      v-model:page="page"
      :items-per-page="itemsPerPage"
      :headers="[
        { title: 'Cliente', key: 'user.name' },
        { title: 'Carro', key: 'car.model' },
        { title: 'Retirada', key: 'startDate' },
        { title: 'Status', key: 'status' },
        { title: 'Valor Est.', key: 'totalValue' },
        { title: 'Ações', key: 'actions', sortable: false, align: 'end' },
      ]"
      :items="rentals"
      :items-length="totalItems"
      :loading="loading"
      @update:options="loadData"
    >
      <template v-slot:item.startDate="{ item }">
        {{ formatDate(item.startDate) }}
      </template>

      <template v-slot:item.totalValue="{ item }">
        {{ formatCurrency(item.totalValue) }}
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip :color="getRentalStatusColor(item.status)" size="small" class="font-weight-bold">
          {{ formatRentalStatus(item.status) }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        
        <v-btn
          v-if="item.status === 'CONFIRMED'"
          color="success"
          size="small"
          variant="tonal"
          class="mr-2"
          @click="handleCheckIn(item)"
        >
          <v-icon start>mdi-key-variant</v-icon>
          Entregar
        </v-btn>

        <v-btn
          v-if="item.status === 'ACTIVE'"
          color="primary"
          size="small"
          variant="tonal"
          @click="openFinalize(item)"
        >
          <v-icon start>mdi-flag-checkered</v-icon>
          Receber
        </v-btn>
      </template>
    </v-data-table-server>

    <v-dialog v-model="showFinalizeDialog" max-width="400">
      <v-card title="Receber Veículo">
        <v-card-text>
          <p class="mb-4">Informe a quilometragem atual do veículo no momento da devolução.</p>
          <v-text-field
            v-model="endMileage"
            label="Hodômetro Final (KM)"
            type="number"
            variant="outlined"
            autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showFinalizeDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="confirmLoading" @click="handleFinalize">
            Confirmar Devolução
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>