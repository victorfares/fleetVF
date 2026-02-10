<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    :fullscreen="mobile"
    transition="dialog-bottom-transition"
    max-width="800"
    persistent
  >
    <v-card class="rounded-lg">
      <v-toolbar color="white" class="border-b pr-2" elevation="0">
        <v-toolbar-title class="text-h6 font-weight-bold pl-4">
          {{ isEditing ? 'Editar Veículo' : 'Novo Veículo' }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="close"></v-btn>
      </v-toolbar>

      <v-card-text class="pa-4 pa-md-6 bg-grey-lighten-5">
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-form ref="formRef" @submit.prevent="save">
          <v-container class="pa-0">
            <v-row dense>
              
              <v-col cols="12" class="mb-2">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-1 mb-1">DADOS DO VEÍCULO</div>
                <v-divider></v-divider>
                <div v-if="isEditing" class="text-caption text-orange-darken-2 mt-1 font-weight-medium">
                  * Placa não pode ser alterada após criação.
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.brand"
                  label="Marca"
                  variant="outlined"
                  bg-color="white"
                  :rules="[rules.required]"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.model"
                  label="Modelo"
                  variant="outlined"
                  bg-color="white"
                  :rules="[rules.required]"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.licensePlate"
                  label="Placa"
                  variant="outlined"
                  bg-color="white"
                  :rules="[rules.required]"
                  class="text-uppercase"
                  maxlength="8"
                  density="comfortable"
                  prepend-inner-icon="mdi-card-account-details-outline"
                  :disabled="isEditing"
                  :hint="isEditing ? 'Campo imutável' : ''"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" class="mt-4 mb-2">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-1 mb-1">OPERACIONAL & FINANCEIRO</div>
                <v-divider></v-divider>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.dailyRate"
                  label="Valor da Diária"
                  prefix="R$"
                  type="number"
                  variant="outlined"
                  bg-color="white"
                  :rules="[rules.required, rules.positive]"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.currentMileage"
                  label="Quilometragem Atual"
                  suffix="km"
                  type="number"
                  variant="outlined"
                  bg-color="white"
                  :rules="[rules.required, rules.minCurrentKm]"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="formData.agencyId"
                  :items="agencies"
                  item-title="name"
                  item-value="id"
                  label="Agência de Origem"
                  variant="outlined"
                  bg-color="white"
                  :loading="loadingAgencies"
                  :rules="[rules.required]"
                  no-data-text="Nenhuma agência encontrada"
                  density="comfortable"
                ></v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.status"
                  :items="statusOptions"
                  item-title="title" 
                  item-value="value"
                  label="Status Atual"
                  variant="outlined"
                  bg-color="white"
                  density="comfortable"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.title">
                      <template v-slot:prepend>
                        <v-icon :color="getStatusColor(item.raw.value)" icon="mdi-circle-small"></v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.imageUrl"
                  label="URL da Imagem (Opcional)"
                  variant="outlined"
                  bg-color="white"
                  density="comfortable"
                  prepend-inner-icon="mdi-camera-outline"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn 
          color="primary" 
          variant="flat" 
          :loading="saving" 
          @click="save"
          class="px-6 font-weight-bold"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue'; 
import { useDisplay } from 'vuetify';
import { useCarForm } from '@/composables/useCarForm';
import { CarStatus } from '@/types/Car';
import type { Car } from '@/types/Car';

const props = defineProps<{
  modelValue: boolean;
  carToEdit?: Car | null;
}>();

const emit = defineEmits(['update:modelValue', 'saved']);

const { mobile } = useDisplay();
const errorMessage = ref('');


const { 
  formRef, 
  formData, 
  rules, 
  saving, 
  isEditing,
  agencies, 
  loadingAgencies, 
  statusOptions, 
  initForm,
  save 
} = useCarForm({
  carRef: toRef(props, 'carToEdit'), 
  onSaved: () => {
    emit('saved');
    close();
  },
  onError: (msg) => {
    errorMessage.value = msg;
  }
});

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      errorMessage.value = '';
      initForm(); 
    }
  }
);

function getStatusColor(status: string) {
  if (status === CarStatus.AVAILABLE) return 'success';
  if (status === CarStatus.RENTED) return 'warning';
  return 'error';
}

function close() {
  emit('update:modelValue', false);
}
</script>