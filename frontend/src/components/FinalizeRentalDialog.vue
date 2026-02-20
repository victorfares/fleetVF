<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAlertStore } from '@/stores/alert';

const props = defineProps<{
  modelValue: boolean;
  rental: any;
  loading: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const endMileage = ref<number | null>(null);
const alertStore = useAlertStore(); // <-- Instanciando a store

watch(() => props.rental, (newVal) => {
  if (newVal) endMileage.value = newVal.car?.currentMileage || 0;
});

const handleConfirm = () => {
  if (!endMileage.value) {
    return alertStore.showWarning("Informe a quilometragem final do veículo.", "Atenção");
  }
  
  if (endMileage.value < (props.rental?.car?.currentMileage || 0)) {
    return alertStore.showError("A quilometragem final não pode ser menor que a inicial.", "Quilometragem Inválida");
  }
  
  emit('confirm', Number(endMileage.value));
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500" persistent>
    <v-card class="rounded-xl bg-white elevation-5" v-if="rental">
      <v-card-title class="bg-black text-white py-4 font-weight-bold d-flex align-center">
        <v-icon icon="mdi-flag-checkered" class="mr-3"></v-icon> Finalizar Locação
      </v-card-title>
      <v-card-text class="pa-6">
        <v-alert color="info" variant="tonal" icon="mdi-information" class="mb-4 rounded-lg font-weight-bold" density="compact">
          Confira o veículo antes de confirmar a quilometragem final.
        </v-alert>
        <v-text-field
          v-model="endMileage"
          label="Quilometragem Final"
          type="number"
          variant="outlined"
          suffix="KM"
          color="black"
          base-color="black"
          class="font-weight-black text-black"
          hide-details="auto"
          autofocus
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('update:modelValue', false)" color="grey-darken-3" class="font-weight-bold" :disabled="loading">Cancelar</v-btn>
        <v-btn color="black" variant="flat" class="font-weight-black px-6" :loading="loading" @click="handleConfirm">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>