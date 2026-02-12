<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRentals } from '@/composables/useRentals';
import { useAgencies } from '@/composables/useAgencies';
import { useAuthStore } from '@/stores/auth';
import type { Car } from '@/types/Car';

const props = defineProps<{
  modelValue: boolean;
  car: Car | null;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const router = useRouter();
const authStore = useAuthStore();
const { createRental, loading: renting } = useRentals();
const { agencies, fetchAgencies } = useAgencies();

// Estados do Formulário
const startDate = ref('');
const endDate = ref('');
const returnAgencyId = ref<string | null>(null);

// Estado de Controle da Tela (Formulário vs Sucesso)
const showSuccessScreen = ref(false);

const init = () => {
  if (agencies.value.length === 0) fetchAgencies();
  
  // Preenche a agência de devolução com a mesma da retirada por padrão
  if (props.car) {
    returnAgencyId.value = props.car.agency.id;
  }
  
  showSuccessScreen.value = false;
};

const handleClose = () => {
  emit('update:modelValue', false);
  setTimeout(() => {
    startDate.value = '';
    endDate.value = '';
    showSuccessScreen.value = false;
  }, 300);
};

const handleSubmit = async () => {
  if (!props.car || !authStore.user) return;

  try {
    await createRental({
      userId: authStore.user.id,
      carId: props.car.id,
      pickupAgencyId: props.car.agency.id,
      returnAgencyId: returnAgencyId.value || props.car.agency.id,
      startDate: new Date(startDate.value).toISOString(),
      endDate: new Date(endDate.value).toISOString(),
    });
    
    emit('success'); 
    
    showSuccessScreen.value = true; 

  } catch (err) {
  }
};

const goToMyRentals = () => {
  handleClose();
  router.push('/meus-alugueis');
};

const isValid = computed(() => {
  return startDate.value && endDate.value && new Date(endDate.value) > new Date(startDate.value);
});
</script>

<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="handleClose"
    max-width="500"
    @after-enter="init"
    persistent
  >
    <v-window v-model="showSuccessScreen">
      
      <v-window-item :value="false">
        <v-card class="rounded-lg bg-white" v-if="car">
          <v-card-title class="bg-primary text-white py-4 font-weight-bold d-flex align-center">
            <v-icon icon="mdi-calendar-check" class="mr-2"></v-icon>
            Reservar {{ car.model }}
          </v-card-title>
          
          <v-card-text class="pt-6">
            <v-alert icon="mdi-information" variant="tonal" color="info" class="mb-4 text-caption rounded-lg">
              A tarifa diária é <strong>R$ {{ car.dailyRate }}</strong>. 
              Taxa de retorno de 30% aplica-se se devolver em outra cidade.
            </v-alert>

            <v-form @submit.prevent="handleSubmit">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="startDate"
                    label="Data de Retirada"
                    type="datetime-local"
                    variant="outlined"
                    density="comfortable"
                    color="primary"
                    bg-color="white"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="endDate"
                    label="Data de Devolução"
                    type="datetime-local"
                    variant="outlined"
                    density="comfortable"
                    color="primary"
                    bg-color="white"
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="returnAgencyId"
                    :items="agencies"
                    item-title="name"
                    item-value="id"
                    label="Local de Devolução"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-map-marker-down"
                    color="primary"
                    bg-color="white"
                  ></v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4 bg-white">
            <v-spacer></v-spacer>
            <v-btn variant="text" color="grey-darken-1" @click="handleClose">Cancelar</v-btn>
            <v-btn 
              color="primary" 
              variant="flat" 
              :loading="renting" 
              :disabled="!isValid"
              @click="handleSubmit"
              class="font-weight-bold"
            >
              Confirmar Reserva
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>

      <v-window-item :value="true">
        <v-card class="rounded-lg bg-white text-center pa-8">
          
          <div class="mb-6">
            <v-avatar color="success" size="80" variant="tonal" class="mb-4">
              <v-icon icon="mdi-check-bold" size="48" color="success"></v-icon>
            </v-avatar>
            <h2 class="text-h5 font-weight-black text-success mb-2">Reserva Confirmada!</h2>
            <p class="text-body-1 text-grey-darken-1">
              Seu veículo <strong>{{ car?.model }}</strong> já está reservado.
            </p>
          </div>

          <v-sheet border rounded="lg" class="bg-grey-lighten-5 pa-4 mb-6 text-left">
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-calendar-arrow-right" size="small" class="mr-2 text-primary"></v-icon>
              <span class="text-caption text-grey">Retirada:</span>
              <span class="ml-auto font-weight-bold text-body-2">{{ startDate ? new Date(startDate).toLocaleString('pt-BR') : '-' }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon icon="mdi-map-marker" size="small" class="mr-2 text-primary"></v-icon>
              <span class="text-caption text-grey">Local:</span>
              <span class="ml-auto font-weight-bold text-body-2 text-truncate" style="max-width: 150px;">
                {{ agencies.find(a => a.id === props.car?.agency.id)?.name }}
              </span>
            </div>
          </v-sheet>

          <div class="d-flex flex-column ga-3">
            <v-btn 
              color="primary" 
              size="large" 
              block 
              variant="flat" 
              class="font-weight-bold"
              prepend-icon="mdi-history"
              @click="goToMyRentals"
            >
              Ver Meus Aluguéis
            </v-btn>
            
            <v-btn 
              variant="text" 
              block 
              color="grey-darken-1"
              @click="handleClose"
            >
              Continuar navegando
            </v-btn>
          </div>

        </v-card>
      </v-window-item>

    </v-window>
  </v-dialog>
</template>