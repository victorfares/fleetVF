<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const valid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const errorMessage = ref('');
const showExpiredAlert = ref(false);

const form = ref({
  email: '',
  password: '',
});

const rules = {
  required: (v: string) => !!v || 'Campo obrigatório',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
};

onMounted(() => {
  if (route.query.expired === 'true') {
    showExpiredAlert.value = true;
    router.replace({ query: {} });
  }
});

async function handleLogin() {
  if (!valid.value) return;

  loading.value = true;
  errorMessage.value = '';
  showExpiredAlert.value = false;

  try {
    await authStore.login(form.value);
    router.push('/');
  } catch (error: any) {
    console.error('Falha no login:', error);
    errorMessage.value = 'E-mail ou senha incorretos. Tente novamente.';
  } finally {
    loading.value = false;
  }
}

function goToRegister() {
  router.push('/signup');
}
</script>

<template>
  <v-container fluid class="fill-height bg-grey-lighten-5 pa-0">
    <v-row align="center" justify="center" class="ma-0 fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        
        <v-card class="rounded-xl pa-4 bg-white border" elevation="4">
          <v-card-title class="text-center pt-6 pb-2">
            <v-icon icon="mdi-steering" size="x-large" color="amber-darken-1" class="mb-2"></v-icon>
            <h2 class="text-h4 font-weight-black text-black">FleetVF</h2>
            <p class="text-body-2 text-grey-darken-2 mt-2 font-weight-medium">
              Gestão inteligente para sua frota
            </p>
          </v-card-title>

          <v-card-text class="pa-4 pa-md-6">
            
            <v-alert
              v-if="showExpiredAlert"
              type="warning"
              variant="tonal"
              density="compact"
              icon="mdi-clock-alert-outline"
              title="Sessão Expirada"
              text="Por motivos de segurança, sua sessão foi encerrada. Por favor, faça login novamente."
              class="mb-6 font-weight-bold"
              closable
              @click:close="showExpiredAlert = false"
            ></v-alert>

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

            <v-form v-model="valid" @submit.prevent="handleLogin">
              
              <div class="text-subtitle-2 font-weight-black mb-1 ml-1 text-black">E-MAIL</div>
              <v-text-field
                v-model="form.email"
                :rules="[rules.required, rules.email]"
                placeholder="seu@email.com"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                base-color="black"
                color="amber-darken-2"
                bg-color="white"
                density="comfortable"
                class="mb-2 text-black font-weight-medium"
              ></v-text-field>

              <div class="text-subtitle-2 font-weight-black mb-1 ml-1 text-black">SENHA</div>
              <v-text-field
                v-model="form.password"
                :rules="[rules.required]"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Sua senha"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                base-color="black"
                color="amber-darken-2"
                bg-color="white"
                density="comfortable"
                class="text-black font-weight-medium"
              ></v-text-field>

              <v-btn
                block
                size="large"
                color="amber-darken-1"
                type="submit"
                variant="flat"
                class="mt-6 font-weight-bold text-black text-body-1"
                :loading="loading"
                height="48"
                rounded="lg"
              >
                ENTRAR
              </v-btn>
            </v-form>

            <div class="d-flex align-center justify-center mt-6">
              <span class="text-grey-darken-2 text-body-2 font-weight-medium">Não tem uma conta?</span>
              <v-btn 
                variant="text" 
                color="black" 
                class="font-weight-black ml-1 px-2"
                size="small"
                @click="goToRegister"
              >
                Criar conta gratuita
              </v-btn>
            </div>

          </v-card-text>
        </v-card>

        <div class="text-center mt-6 text-grey-darken-1 text-caption font-weight-medium">
          &copy; 2026 FleetVF. Todos os direitos reservados.
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>