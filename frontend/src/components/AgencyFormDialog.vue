<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
    transition="dialog-bottom-transition"
  >
    <v-card 
      theme="light" 
      color="white" 
      elevation="24" 
      rounded="xl" 
      variant="flat"
      class="bg-white"
    >
      <v-toolbar color="secondary" class="px-4">
        <v-toolbar-title class="text-h6 font-weight-bold text-white">
          <v-icon icon="mdi-office-building-plus" class="mr-2"></v-icon>
          Nova Agência
        </v-toolbar-title>
        <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
      </v-toolbar>

      <v-card-text class="pt-6">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="Nome da Agência"
                placeholder="Ex: FleetVF Matriz"
                variant="outlined"
                base-color="black"
                color="primary"
                bg-color="white"
                class="text-high-emphasis"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.address"
                label="Endereço Completo"
                placeholder="Rua, Número, Bairro"
                variant="outlined"
                base-color="black"
                color="primary"
                bg-color="white"
                class="text-high-emphasis"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.city"
                label="Cidade"
                variant="outlined"
                base-color="black"
                color="primary"
                bg-color="white"
                class="text-high-emphasis"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.state"
                label="UF"
                maxlength="2"
                variant="outlined"
                base-color="black"
                color="primary"
                bg-color="white"
                class="text-high-emphasis"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <v-spacer></v-spacer>
        <v-btn 
          color="grey-darken-3" 
          variant="text" 
          size="large" 
          @click="close"
          class="mr-2 font-weight-bold"
        >
          Cancelar
        </v-btn>
        <v-btn 
          color="secondary" 
          variant="elevated" 
          size="large" 
          @click="save"
          elevation="4"
          :loading="loading"
          class="font-weight-bold"
        >
          Salvar Agência
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '@/services/api';

defineProps<{
  modelValue: boolean;
}>();

// Emits: Comunica com o pai (fechar ou avisar que salvou)
const emit = defineEmits(['update:modelValue', 'saved']);

// Estado local do formulário
const loading = ref(false);
const form = ref({
  name: '',
  city: '',
  state: '',
  address: ''
});

// Ações
const close = () => {
  emit('update:modelValue', false);
};

const save = async () => {
  if (!form.value.name || !form.value.address) {
    alert('Preencha Nome e Endereço.'); 
    return;
  }

  loading.value = true;
  try {
    await api.post('/agencies', form.value);
    emit('saved'); 
    close();
    
    // Limpa o formulário para a próxima vez
    form.value = { name: '', city: '', state: '', address: '' };
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar.');
  } finally {
    loading.value = false;
  }
};
</script>