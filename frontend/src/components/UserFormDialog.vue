<script setup lang="ts">
import { computed, watch } from 'vue';
import { useUserForm } from '@/composables/useUserForm';

const props = defineProps<{
  modelValue: boolean; 
  user: any; 
}>();

const emit = defineEmits(['update:modelValue', 'saved']);

const isEdit = computed(() => !!props.user);

const {
  formRef,
  loading,
  showPassword,
  formData,
  roles,
  rules,
  submitForm,
} = useUserForm();

const closeDialog = () => {
  emit('update:modelValue', false); // Força o fechamento imediato
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.user) {
        formData.value = {
          name: props.user.name || '',
          email: props.user.email || '',
          password: '',
          role: props.user.role || 'CLIENT',
        };
      } else {
        formData.value = { name: '', email: '', password: '', role: 'CLIENT' };
      }
      // Limpa os erros visuais ao abrir
      if (formRef.value) formRef.value.resetValidation();
    }
  }
);

const handleSave = async () => {
  // 1. Força a validação Síncrona do Vuetify
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  // 2. Chama a API
  const success = await submitForm(props.user ? props.user.id : null);
  
  // 3. Se a API retornou 200/201, fecha tudo e avisa a tabela
  if (success) {
    emit('saved'); 
    closeDialog(); 
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px" persistent>
    <v-card class="rounded-xl border bg-white" elevation="10">
      <v-card-title class="pa-4 bg-grey-lighten-4 border-b d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-black text-black">
          {{ isEdit ? 'Editar Usuário' : 'Novo Usuário' }}
        </span>
        <v-btn icon="mdi-close" variant="text" density="comfortable" color="black" @click="closeDialog" :disabled="loading"></v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="handleSave">
          <v-row dense>
            <v-col cols="12">
              <span class="text-caption font-weight-black text-black mb-1 d-block">Nome Completo</span>
              <v-text-field
                v-model="formData.name"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                placeholder="Ex: João da Silva"
                class="font-weight-bold text-black"
                bg-color="grey-lighten-5"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <span class="text-caption font-weight-black text-black mb-1 d-block">Endereço de E-mail</span>
              <v-text-field
                v-model="formData.email"
                :rules="[rules.required, rules.email]"
                variant="outlined"
                density="comfortable"
                placeholder="Ex: joao@email.com"
                type="email"
                class="font-weight-bold text-black"
                bg-color="grey-lighten-5"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <span class="text-caption font-weight-black text-black mb-1 d-block">Perfil de Acesso</span>
              <v-select
                v-model="formData.role"
                :items="roles"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                class="font-weight-bold text-black"
                bg-color="grey-lighten-5"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <span class="text-caption font-weight-black text-black mb-1 d-block">
                {{ isEdit ? 'Nova Senha (opcional)' : 'Senha de Acesso' }}
              </span>
              <v-text-field
                v-model="formData.password"
                :rules="isEdit ? [] : [rules.passwordCreation]"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                density="comfortable"
                :placeholder="isEdit ? 'Deixe em branco para não alterar' : 'Digite uma senha segura'"
                class="font-weight-bold text-black"
                bg-color="grey-lighten-5"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="border-opacity-25 mt-4"></v-divider>

          <v-card-actions class="pa-4 bg-grey-lighten-4 mt-2 px-0 pb-0">
            <v-spacer></v-spacer>
            <v-btn color="error" variant="text" class="font-weight-black" @click="closeDialog" :disabled="loading">
              CANCELAR
            </v-btn>
            <v-btn type="submit" color="black" variant="flat" class="font-weight-black px-6" :loading="loading">
              {{ isEdit ? 'SALVAR ALTERAÇÕES' : 'CRIAR USUÁRIO' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>