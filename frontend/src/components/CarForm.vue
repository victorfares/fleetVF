<template>
  <v-card 
    class="rounded-xl" 
    elevation="10" 
    style="background-color: white !important; opacity: 1 !important;"
  >
    <v-toolbar color="white" class="border-b pr-4" height="70" flat>
      <v-toolbar-title class="text-h6 font-weight-black pl-6 text-black">
        {{ isEditing ? 'Editar Veículo' : 'Novo Veículo' }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" color="black" @click="$emit('cancel')"></v-btn>
    </v-toolbar>

    <v-card-text class="pa-6 pa-md-8">
      <v-form ref="formRef" @submit.prevent="save">
        <v-row dense>
          
          <v-col cols="12" class="mb-2">
            <div class="text-subtitle-1 font-weight-black text-black">Dados do Carro</div>
            <v-divider class="my-2"></v-divider>
            <div v-if="isEditing" class="text-caption text-warning mb-2">
              * Dados de identificação não podem ser alterados.
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption font-weight-bold text-black mb-1 ml-1">MARCA</div>
            <v-text-field
              v-model="formData.brand"
              placeholder="Ex: Toyota"
              variant="outlined"
              color="black"
              base-color="black"
              bg-color="white"
              density="comfortable"
              class="font-weight-bold"
              :disabled="isEditing" 
              :rules="[rules.required]"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption font-weight-bold text-black mb-1 ml-1">MODELO</div>
            <v-text-field
              v-model="formData.model"
              placeholder="Ex: Corolla"
              variant="outlined"
              color="black"
              base-color="black"
              bg-color="white"
              density="comfortable"
              class="font-weight-bold"
              :disabled="isEditing"
              :rules="[rules.required]"
            ></v-text-field>
          </v-col>

          <v-col cols="12" class="mt-4 mb-2">
            <div class="text-subtitle-1 font-weight-black text-black">Detalhes Operacionais</div>
            <v-divider class="my-2"></v-divider>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption font-weight-bold text-black mb-1 ml-1">PLACA</div>
            <v-text-field
              v-model="formData.licensePlate"
              placeholder="ABC-1234"
              variant="outlined"
              color="black"
              base-color="black"
              bg-color="white"
              density="comfortable"
              class="text-uppercase font-weight-bold"
              :disabled="isEditing"
              :rules="[rules.required]"
              maxlength="8"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption font-weight-bold text-black mb-1 ml-1">DIÁRIA (R$)</div>
            <v-text-field
              v-model.number="formData.dailyRate"
              type="number"
              prefix="R$"
              variant="outlined"
              color="black"
              base-color="black"
              bg-color="white"
              density="comfortable"
              class="font-weight-bold"
              :rules="[rules.required, rules.positive]"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption font-weight-bold text-black mb-1 ml-1">QUILOMETRAGEM</div>
            <v-text-field
              v-model.number="formData.currentMileage"
              type="number"
              suffix="km"
              variant="outlined"
              color="black"
              base-color="black"
              bg-color="white"
              density="comfortable"
              class="font-weight-bold"
              :rules="[rules.required, rules.minCurrentKm]" 
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="6">
            <div class="text-caption font-weight-bold text-black mb-1 ml-1">AGÊNCIA</div>
            <v-autocomplete
              v-model="formData.agencyId"
              :items="agencies"
              item-title="name"
              item-value="id"
              placeholder="Selecione..."
              variant="outlined"
              color="black"
              base-color="black"
              bg-color="white"
              density="comfortable"
              class="font-weight-bold"
              :disabled="isEditing"
              :loading="loadingAgencies"
              :rules="[rules.required]"
              no-data-text="Nenhuma agência encontrada"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12" v-if="isEditing">
            <div class="text-caption font-weight-bold text-black mb-1 ml-1">STATUS</div>
            <v-select
              v-model="formData.status"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              color="black"
              base-color="black"
              bg-color="white"
              density="comfortable"
              class="font-weight-bold"
            ></v-select>
          </v-col>

          <v-col cols="12" class="mt-4">
             <div class="text-caption font-weight-bold text-black mb-1 ml-1">URL DA IMAGEM</div>
            <v-text-field
              v-model="formData.imageUrl"
              placeholder="https://..."
              variant="outlined"
              color="black"
              base-color="black"
              bg-color="white"
              density="comfortable"
              class="font-weight-bold"
              prepend-inner-icon="mdi-camera"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4 pa-md-6" style="background-color: white !important;">
      <v-spacer></v-spacer>
      <v-btn 
        variant="text" 
        size="large"
        color="black"
        class="font-weight-bold mr-2"
        @click="$emit('cancel')"
      >
        CANCELAR
      </v-btn>
      <v-btn 
        color="black" 
        variant="flat" 
        size="large"
        elevation="0"
        class="font-weight-bold px-8"
        :loading="saving"
        @click="save"
      >
        SALVAR VEÍCULO
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useCarForm } from '@/composables/useCarForm';
import type { Car } from '@/types/Car';

const props = defineProps<{ carToEdit?: Car | null }>();
const emit = defineEmits(['saved', 'cancel']);

const { 
  formRef, 
  formData, 
  rules, 
  saving, 
  isEditing, 
  agencies, 
  loadingAgencies, 
  statusOptions, 
  save 
} = useCarForm({
  carToEdit: props.carToEdit,
  onSaved: () => emit('saved')
});
</script>