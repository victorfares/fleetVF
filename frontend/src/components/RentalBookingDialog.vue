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
    // Erro já tratado na Store
  }
};

const goToMyRentals = () => {
  handleClose();
  router.push('/meus-alugueis');
};

const isValid = computed(() => {
  return startDate.value && endDate.value && new Date(endDate.value) > new Date(startDate.value);
});

// Helper para formatar o endereço na lista
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
    max-width="600"
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
          
          <v-card-text class="pt-6 pb-2">
            
            <v-alert icon="mdi-tag-text-outline" variant="tonal" color="info" class="mb-6 text-caption rounded-lg border-info" density="compact">
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
                    hint="Quando você vai pegar o carro?"
                    persistent-hint
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
                    hint="Quando você vai devolver?"
                    persistent-hint
                    class="mb-2"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" class="mt-4">
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
                             {{ item.raw.address }} - {{ item.raw.city }}/{{ item.raw.state }}
                           </span>
                        </template>
                      </v-list-item>
                    </template>

                    <template v-slot:selection="{ item }">
                        <div class="d-flex flex-column text-truncate py-1">
                            <span class="text-body-2 font-weight-bold">{{ item.raw.name }}</span>
                            <span class="text-caption text-grey-darken-1 text-truncate">
                                {{ item.raw.address }}
                            </span>
                        </div>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-form>

            <v-alert 
              color="orange-darken-2" 
              variant="tonal" 
              icon="mdi-wallet-outline" 
              class="mt-6 rounded-lg"
              border="start"
            >
              <div class="text-subtitle-2 font-weight-bold mb-1">Pagamento no Check-in</div>
              <div class="text-caption" style="line-height: 1.3;">
                O pagamento será realizado presencialmente na agência. O veículo será liberado 
                imediatamente após o check-in e confirmação.
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
              :disabled="!isValid"
              @click="handleSubmit"
              class="font-weight-bold px-6"
              size="large"
            >
              CONFIRMAR RESERVA
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
            
            <v-divider class="mb-3 border-dashed"></v-divider>

            <div class="d-flex align-start">
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
            
            <div class="mt-4 pt-3 border-t d-flex align-start text-orange-darken-3">
               <v-icon icon="mdi-information-outline" size="small" class="mr-2 mt-0"></v-icon>
               <span class="text-caption font-weight-medium">Lembre-se: O pagamento é feito no balcão da agência.</span>
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