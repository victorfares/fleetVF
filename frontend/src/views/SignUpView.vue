<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const authStore = useAuthStore();
const appStore = useAppStore();

const valid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const errorMessage = ref('');

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const rules = {
  required: (v: string) => !!v || 'Campo obrigatório',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
  min: (v: string) => v.length >= 6 || 'Mínimo de 6 caracteres',
  match: (v: string) => v === form.value.password || 'As senhas não coincidem'
};

async function handleRegister() {
  if (!valid.value) return;

  loading.value = true;
  errorMessage.value = '';

  try {
    const isAutoLogged = await authStore.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    });
    
    if (isAutoLogged) {
      appStore.notify('Cadastro realizado! Bem-vindo(a).', 'success');
      router.push('/'); 
    } else {
      appStore.notify('Conta criada com sucesso! Faça login.', 'success');
      router.push('/login');
    }
    
  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    errorMessage.value = error.response?.data?.message || 'Erro ao criar conta.';
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  router.push('/login');
}
</script>

<template>
  <v-container fluid class="fill-height bg-blue-darken-3 pa-0">
    <v-row align="center" justify="center" class="ma-0 fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        
        <v-card class="rounded-xl pa-4 bg-white" elevation="10">
          <v-card-title class="text-center pt-6 pb-2">
            <h2 class="text-h4 font-weight-black text-black">Nova Conta</h2>
            <p class="text-body-2 text-grey-darken-2 mt-2 font-weight-medium">
              Junte-se à FleetVF e gerencie sua frota
            </p>
          </v-card-title>

          <v-card-text class="pa-4 pa-md-6">
            
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-6 font-weight-bold"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>

            <v-form v-model="valid" @submit.prevent="handleRegister">
              
              <div class="text-subtitle-2 font-weight-black mb-1 ml-1 text-black">NOME COMPLETO</div>
              <v-text-field
                v-model="form.name"
                :rules="[rules.required]"
                placeholder="Ex: Victor Fares"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                base-color="black"
                color="primary"
                bg-color="white"
                density="comfortable"
                class="mb-2 text-black font-weight-medium"
              ></v-text-field>

              <div class="text-subtitle-2 font-weight-black mb-1 ml-1 text-black">E-MAIL</div>
              <v-text-field
                v-model="form.email"
                :rules="[rules.required, rules.email]"
                placeholder="seu@email.com"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                base-color="black"
                color="primary"
                bg-color="white"
                density="comfortable"
                class="mb-2 text-black font-weight-medium"
              ></v-text-field>

              <div class="text-subtitle-2 font-weight-black mb-1 ml-1 text-black">SENHA</div>
              <v-text-field
                v-model="form.password"
                :rules="[rules.required, rules.min]"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Crie uma senha forte"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                base-color="black"
                color="primary"
                bg-color="white"
                density="comfortable"
                class="mb-2 text-black font-weight-medium"
              ></v-text-field>

              <div class="text-subtitle-2 font-weight-black mb-1 ml-1 text-black">CONFIRMAR SENHA</div>
              <v-text-field
                v-model="form.confirmPassword"
                :rules="[rules.required, rules.match]"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Repita a senha"
                prepend-inner-icon="mdi-lock-check-outline"
                variant="outlined"
                base-color="black"
                color="primary"
                bg-color="white"
                density="comfortable"
                class="text-black font-weight-medium"
              ></v-text-field>

              <v-btn
                block
                size="large"
                color="black"
                type="submit"
                variant="flat"
                class="mt-6 font-weight-bold text-body-1"
                :loading="loading"
                height="48"
                rounded="lg"
              >
                CRIAR CONTA E ENTRAR
              </v-btn>
            </v-form>

            <div class="text-center mt-6">
              <span class="text-grey-darken-2 text-body-2 font-weight-medium">Já possui cadastro?</span>
              <a 
                class="text-primary font-weight-black ml-2 text-decoration-none cursor-pointer"
                @click="goToLogin"
              >
                Fazer Login
              </a>
            </div>

          </v-card-text>
        </v-card>

        <div class="text-center mt-6 text-white text-caption opacity-80">
          &copy; {{ new Date().getFullYear() }} FleetVF. Todos os direitos reservados.
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  text-decoration: underline !important;
}
.opacity-80 {
  opacity: 0.8;
}
</style>