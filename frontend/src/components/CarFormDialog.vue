<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="close"
    max-width="700px"
    persistent
    transition="dialog-bottom-transition"
  >
    <CarForm 
      v-if="modelValue"
      :car-to-edit="carToEdit"
      @saved="onSaved"
      @cancel="close"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import CarForm from '@/components/CarForm.vue';
import type { Car } from '@/types/Car';

defineProps<{
  modelValue: boolean;
  carToEdit?: Car | null;
}>();

const emit = defineEmits(['update:modelValue', 'saved']);

const close = () => {
  emit('update:modelValue', false);
};

const onSaved = () => {
  emit('saved');
  close();
};
</script>