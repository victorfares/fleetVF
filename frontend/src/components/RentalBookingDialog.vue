<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRentals } from '@/composables/useRentals';
import { useAgencies } from '@/composables/useAgencies';
import { useFormatters } from '@/composables/useFormatters'; // Importe os formatadores
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
const { formatCurrency } = useFormatters(); // Helper de moeda

// Estados do Formulário
const startDate = ref('');
const endDate = ref('');
const returnAgencyId = ref<string | null>(null);

const showSuccessScreen = ref(false);

const init = () => {
  if (agencies.value.length === 0) fetchAgencies();
  
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

// --- LÓGICA DE CÁLCULO DE PREÇO (LIVE PRICING) ---
const bookingSummary = computed(() => {
  if (!startDate.value || !endDate.value || !props.car) return null;

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  if (end <= start) return null;

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const days = diffDays > 0 ? diffDays : 1;

  const dailyRate = Number(props.car.dailyRate);
  const subtotal = days * dailyRate;

  const isOneWay = returnAgencyId.value !== props.car.agency.id;
  const returnFee = isOneWay ? subtotal * 0.30 : 0;

  const total = subtotal + returnFee;

  return {
    days,
    dailyRate,
    subtotal,
    isOneWay,
    returnFee,
    total
  };
});

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

const getFormattedAddress = (agencyId: string) => {
  const agency = agencies.value.find(a => a.id === agencyId);
  if (!agency) return '';
  return `${agency.address} - ${agency.city}/${agency.state}`;
};
</script>

<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="handleClose"
    max-width="700"
    @after-enter="init"
    persistent
  >
    <v-window v-model="showSuccessScreen">
      
      <v-window-item :value="false">
        <v-card class="rounded-lg bg-white" v-if="car">
          <v-card-title class="bg-primary text-white py-4 font-weight-bold d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-calendar-check" class="mr-2"></v-icon>
              Reservar {{ car.model }}
            </div>
            <v-btn icon="mdi-close" variant="text" density="compact" @click="handleClose"></v-btn>
          </v-card-title>
          
          <v-card-text class="pt-6 pb-2">
            
            <v-alert icon="mdi-tag-text-outline" variant="tonal" color="info" class="mb-6 text-caption rounded-lg border-info" density="compact">
              A tarifa diária é <strong>{{ formatCurrency(Number(car.dailyRate)) }}</strong>. 
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
                    class="mb-2"
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
                    class="mb-2"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="`${car.agency.name} (${car.agency.city})`"
                    label="Local de Retirada (Fixo)"
                    variant="filled" 
                    readonly
                    density="comfortable"
                    prepend-inner-icon="mdi-map-marker-lock"
                    color="grey-darken-2"
                    bg-color="grey-lighten-4"
                    class="mb-2"
                    hint="O carro deve ser retirado na agência de origem."
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
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
                    hint="Escolha onde devolver o veículo"
                    persistent-hint
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" class="py-2">
                        <template v-slot:title>
                           <span class="font-weight-bold text-body-1">{{ item.raw.name }}</span>
                        </template>
                        <template v-slot:subtitle>
                           <span class="text-caption text-grey-darken-1 d-flex align-center mt-1">
                             <v-icon icon="mdi-map-marker-outline" size="x-small" class="mr-1"></v-icon>
                             {{ item.raw.address }} - {{ item.raw.city }}
                           </span>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-form>

            <v-fade-transition>
              <v-sheet 
                v-if="bookingSummary" 
                class="mt-6 bg-grey-lighten-5 rounded-lg pa-4 border"
              >
                <div class="text-subtitle-2 font-weight-black mb-3 d-flex align-center">
                  <v-icon icon="mdi-receipt-text-outline" class="mr-2" size="small"></v-icon>
                  Resumo de Valores
                </div>

                <div class="d-flex justify-space-between text-body-2 mb-1">
                  <span class="text-grey-darken-2">{{ bookingSummary.days }} diárias x {{ formatCurrency(bookingSummary.dailyRate) }}</span>
                  <span class="font-weight-bold">{{ formatCurrency(bookingSummary.subtotal) }}</span>
                </div>

                <div v-if="bookingSummary.isOneWay" class="d-flex justify-space-between text-body-2 mb-1 text-orange-darken-2">
                  <span>Taxa de Retorno (30%)</span>
                  <span class="font-weight-bold">+ {{ formatCurrency(bookingSummary.returnFee) }}</span>
                </div>

                <v-divider class="my-3"></v-divider>

                <div class="d-flex justify-space-between align-center">
                  <span class="text-h6 font-weight-bold text-grey-darken-3">Total Estimado</span>
                  <span class="text-h5 font-weight-black text-primary">
                    {{ formatCurrency(bookingSummary.total) }}
                  </span>
                </div>
              </v-sheet>
            </v-fade-transition>

            <v-alert 
              color="orange-darken-2" 
              variant="tonal" 
              icon="mdi-wallet-outline" 
              class="mt-4 rounded-lg"
              border="start"
              density="compact"
            >
              <div class="text-caption font-weight-bold">Pagamento no Check-in</div>
              <div class="text-caption" style="line-height: 1.2;">
                O pagamento é realizado presencialmente na retirada do veículo.
              </div>
            </v-alert>

          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4 bg-white">
            <v-spacer></v-spacer>
            <v-btn variant="text" color="grey-darken-3" @click="handleClose" class="font-weight-medium">Cancelar</v-btn>
            <v-btn 
              color="primary" 
              variant="flat" 
              :loading="renting" 
              :disabled="!isValid || !bookingSummary"
              @click="handleSubmit"
              class="font-weight-bold px-6"
              size="large"
            >
              CONFIRMAR ({{ bookingSummary ? formatCurrency(bookingSummary.total) : '---' }})
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>

      <v-window-item :value="true">
        <v-card class="rounded-lg bg-white text-center pa-8">
          
          <div class="mb-6">
            <v-avatar color="success" size="90" variant="tonal" class="mb-4">
              <v-icon icon="mdi-check-bold" size="54" color="success"></v-icon>
            </v-avatar>
            <h2 class="text-h5 font-weight-black text-success mb-2">Reserva Confirmada!</h2>
            <p class="text-body-1 text-grey-darken-2">
              Seu veículo <strong>{{ car?.model }}</strong> já está reservado.
            </p>
          </div>

          <v-sheet border rounded="lg" class="bg-grey-lighten-5 pa-4 mb-6 text-left">
             <div class="d-flex align-center mb-3">
              <v-icon icon="mdi-calendar-arrow-right" size="small" class="mr-3 text-primary"></v-icon>
              <span class="text-caption text-grey-darken-1 font-weight-bold text-uppercase">Retirada</span>
              <span class="ml-auto font-weight-bold text-body-2">{{ startDate ? new Date(startDate).toLocaleString('pt-BR') : '-' }}</span>
            </div>
            
            <div class="d-flex align-start mt-3">
              <v-icon icon="mdi-map-marker" size="small" class="mr-3 mt-1 text-primary"></v-icon>
              <div class="flex-grow-1">
                 <span class="text-caption text-grey-darken-1 font-weight-bold text-uppercase d-block mb-1">Local de Retirada</span>
                 <span class="font-weight-bold text-body-2 d-block">
                    {{ agencies.find(a => a.id === props.car?.agency.id)?.name }}
                 </span>
                 <span class="text-caption text-grey-darken-2 d-block" style="line-height: 1.3;">
                    {{ props.car ? getFormattedAddress(props.car.agency.id) : '' }}
                 </span>
              </div>
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
              color="grey-darken-2"
              @click="handleClose"
              class="font-weight-medium"
            >
              Continuar navegando
            </v-btn>
          </div>

        </v-card>
      </v-window-item>

    </v-window>
  </v-dialog>
</template>