<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
    persistent
  >
    <v-card class="rounded-lg bg-white" color="white" elevation="24">
      <v-toolbar color="white" elevation="0" class="border-b pr-4">
        <v-toolbar-title class="text-h6 font-weight-black text-black">
          {{ isEditing ? 'Editar Agência' : 'Nova Agência' }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" color="black" @click="close"></v-btn>
      </v-toolbar>

      <v-card-text class="pa-4 pa-md-6">
        <v-form ref="formRef" @submit.prevent="save">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Nome da Agência"
                variant="outlined"
                bg-color="grey-lighten-5"
                class="text-black font-weight-bold"
                density="comfortable"
                :rules="[rules.required]"
                color="primary"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field
                v-model="formData.city"
                label="Cidade"
                variant="outlined"
                bg-color="grey-lighten-5"
                class="text-black font-weight-medium"
                density="comfortable"
                :rules="[rules.required]"
                color="primary"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.state"
                label="UF"
                variant="outlined"
                bg-color="grey-lighten-5"
                class="text-black font-weight-medium text-uppercase"
                density="comfortable"
                :rules="[rules.required, rules.uf]"
                maxlength="2"
                color="primary"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="formData.address"
                label="Endereço Completo"
                variant="outlined"
                bg-color="grey-lighten-5"
                class="text-black font-weight-medium"
                density="comfortable"
                :rules="[rules.required]"
                color="primary"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-spacer></v-spacer>
        <v-btn 
          variant="text" 
          color="grey-darken-3" 
          class="font-weight-bold"
          @click="close"
        >
          Cancelar
        </v-btn>
        <v-btn 
          color="black" 
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
import { ref, computed, watch, reactive } from 'vue';
import api from '@/services/api';
import type { Agency } from '@/types/Agency';

const props = defineProps<{
  modelValue: boolean;
  agencyToEdit?: Agency | null;
}>();

const emit = defineEmits(['update:modelValue', 'saved']);

const formRef = ref<any>(null);
const saving = ref(false);

const formData = reactive({
  name: '',
  city: '',
  state: '',
  address: ''
});

const isEditing = computed(() => !!props.agencyToEdit);

const rules = {
  required: (v: string) => !!v || 'Campo obrigatório',
  uf: (v: string) => v.length === 2 || '2 letras'
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.agencyToEdit) {
      formData.name = props.agencyToEdit.name;
      formData.city = props.agencyToEdit.city;
      formData.state = props.agencyToEdit.state;
      formData.address = props.agencyToEdit.address;
    } else {
      formData.name = '';
      formData.city = '';
      formData.state = '';
      formData.address = '';
    }
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const save = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (isEditing.value && props.agencyToEdit) {
      await api.patch(`/agencies/${props.agencyToEdit.id}`, formData);
    } else {
      await api.post('/agencies', formData);
    }
    emit('saved');
    close();
  } catch (error) {
    console.error('Erro ao salvar:', error);
  } finally {
    saving.value = false;
  }
};
</script>