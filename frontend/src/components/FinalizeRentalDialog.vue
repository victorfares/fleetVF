<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  rental: any;
  loading: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const endMileage = ref<number | null>(null);

// Reseta o KM ao abrir com o valor atual do carro
watch(() => props.rental, (newVal) => {
  if (newVal) endMileage.value = newVal.car?.currentMileage || 0;
});

const handleConfirm = () => {
  if (!endMileage.value) return alert("Informe a quilometragem.");
  if (endMileage.value < (props.rental?.car?.currentMileage || 0)) {
    return alert("KM final não pode ser menor que a inicial.");
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
        <v-alert color="info" variant="tonal" icon="mdi-information" class="mb-4 rounded-lg" density="compact">
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
          class="font-weight-bold"
          hide-details="auto"
          autofocus
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('update:modelValue', false)" color="grey-darken-3" :disabled="loading">Cancelar</v-btn>
        <v-btn color="black" variant="flat" class="font-weight-bold px-6" :loading="loading" @click="handleConfirm">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>