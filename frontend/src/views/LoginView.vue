<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const valid = ref(false);
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const form = ref({
  email: '',
  password: ''
});

const rules = {
  required: (v: string) => !!v || 'Campo obrigatório',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
  min: (v: string) => v.length >= 6 || 'Mínimo de 6 caracteres',
};

async function handleLogin() {
  if (!valid.value) return;
  
  loading.value = true;
  error.value = '';

  try {
    await authStore.login(form.value);
    router.push('/');
  } catch (err: any) {
    // Tratamento de erro vindo do Backend
    if (err.response?.status === 401) {
      error.value = 'E-mail ou senha inválidos.';
    } else {
      error.value = 'Erro ao conectar com o servidor.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center bg-grey-lighten-4" fluid>
    <v-card width="400" elevation="8" rounded="lg" class="pa-4">
      
      <v-card-title class="text-center text-h5 font-weight-bold text-primary mb-4">
        FleetVF Login
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <v-form v-model="valid" @submit.prevent="handleLogin">
          <v-text-field
            v-model="form.email"
            label="E-mail"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            :rules="[rules.required, rules.email]"
            class="mb-2"
          ></v-text-field>

          <v-text-field
            v-model="form.password"
            label="Senha"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            :rules="[rules.required, rules.min]"
            @click:append-inner="showPassword = !showPassword"
          ></v-text-field>

          <v-btn
            block
            color="primary"
            size="large"
            type="submit"
            :loading="loading"
            :disabled="!valid"
            class="mt-4"
          >
            Entrar
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn variant="text" color="secondary" to="/signup">
          Criar nova conta
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>