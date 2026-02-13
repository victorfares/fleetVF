<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCars } from '@/composables/useCars';
import { useFormatters } from '@/composables/useFormatters';
import RentalBookingDialog from '@/components/RentalBookingDialog.vue';

const route = useRoute();
const router = useRouter();
const { car, loading, fetchCarById } = useCars();
const { formatCurrency, formatRentalStatus } = useFormatters();

const showBookingDialog = ref(false);

onMounted(() => {
  const carId = route.params.id as string;
  fetchCarById(carId);
});

const specs = [
  { icon: 'mdi-speedometer', label: '0-100 km/h', value: '8.7s' },
  { icon: 'mdi-gas-station', label: 'Combustível', value: 'Flex' },
  { icon: 'mdi-car-shift-pattern', label: 'Câmbio', value: 'Automático' },
  { icon: 'mdi-account-group', label: 'Ocupantes', value: '5 Pessoas' },
  { icon: 'mdi-bag-suitcase', label: 'Porta-Malas', value: '450L' },
  { icon: 'mdi-air-conditioner', label: 'Ar Cond.', value: 'Digital' },
];
</script>

<template>
  <v-container class="py-8">
    
    <v-btn 
      variant="text" 
      prepend-icon="mdi-arrow-left" 
      class="mb-6 font-weight-bold text-grey-darken-2"
      @click="router.back()"
    >
      Voltar para a Frota
    </v-btn>

    <v-row v-if="loading">
      <v-col cols="12" md="8"><v-skeleton-loader type="image, article" height="400" class="rounded-xl"></v-skeleton-loader></v-col>
      <v-col cols="12" md="4"><v-skeleton-loader type="article, actions" height="400" class="rounded-xl"></v-skeleton-loader></v-col>
    </v-row>

    <v-row v-else-if="car">
      
      <v-col cols="12" md="7" lg="8">
        <v-card elevation="0" class="rounded-xl overflow-hidden bg-grey-lighten-5 mb-6">
          <v-img 
            :src="car.imageUrl || 'https://via.placeholder.com/800x600?text=Sem+Imagem'" 
            height="500" 
            cover 
            class="align-end"
          >
            <v-chip 
              v-if="car.status !== 'AVAILABLE'"
              color="error" 
              class="ma-4 font-weight-bold text-uppercase elevation-4"
              size="large"
            >
              Indisponível
            </v-chip>
          </v-img>
        </v-card>

        <h2 class="text-h5 font-weight-bold mb-4 text-black">Especificações do Veículo</h2>
        <v-row>
          <v-col cols="6" sm="4" md="4" v-for="(spec, i) in specs" :key="i">
            <v-card variant="outlined" class="py-4 px-2 text-center rounded-lg border-opacity-25" color="grey">
              <v-icon :icon="spec.icon" size="large" color="primary" class="mb-2"></v-icon>
              <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">{{ spec.label }}</div>
              <div class="text-body-1 font-weight-bold text-black">{{ spec.value }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-8"></v-divider>

        <h2 class="text-h5 font-weight-bold mb-3 text-black">Sobre este carro</h2>
        <p class="text-body-1 text-grey-darken-2" style="line-height: 1.8;">
          Este <strong>{{ car.brand }} {{ car.model }}</strong> é a escolha perfeita para quem busca conforto e desempenho. 
          Situado na agência <strong>{{ car.agency.name }}</strong> ({{ car.agency.city }}), ele conta com manutenção em dia 
          e higienização completa antes de cada locação. Ideal para viagens em família ou compromissos executivos.
        </p>
      </v-col>

      <v-col cols="12" md="5" lg="4">
        <div class="position-sticky" style="top: 100px;">
          <v-card elevation="12" class="rounded-xl pa-6 bg-white border">
            
            <div class="mb-2">
              <span class="text-caption font-weight-bold text-grey text-uppercase">{{ car.brand }}</span>
              <h1 class="text-h4 font-weight-black text-primary">{{ car.model }}</h1>
            </div>

            <div class="d-flex align-center mb-6">
              <v-icon icon="mdi-map-marker" size="small" color="grey-darken-1" class="mr-1"></v-icon>
              <span class="text-body-2 text-grey-darken-1">{{ car.agency.city }} - {{ car.agency.state }}</span>
            </div>

            <v-divider class="mb-6"></v-divider>

            <div class="d-flex align-end justify-space-between mb-2">
              <span class="text-body-1 text-grey-darken-3 font-weight-medium">Diária a partir de</span>
              <div class="text-right">
                <span class="text-h4 font-weight-black text-black">{{ formatCurrency(Number(car.dailyRate)) }}</span>
                <span class="text-caption text-grey font-weight-medium d-block">/ dia</span>
              </div>
            </div>

            <v-sheet color="blue-lighten-5" class="pa-4 rounded-lg mb-6 d-flex align-center">
              <v-icon icon="mdi-shield-check" color="primary" class="mr-3"></v-icon>
              <span class="text-caption text-blue-darken-3 font-weight-bold" style="line-height: 1.2;">
                Seguro básico e Proteção contra terceiros inclusos no valor.
              </span>
            </v-sheet>

            <v-btn 
              block 
              color="primary" 
              size="x-large" 
              class="font-weight-bold rounded-lg mb-3"
              height="56"
              elevation="4"
              :disabled="car.status !== 'AVAILABLE'"
              @click="showBookingDialog = true"
            >
              {{ car.status === 'AVAILABLE' ? 'Reservar Agora' : 'Indisponível' }}
            </v-btn>

            <div class="text-center">
              <span class="text-caption text-grey">Cancelamento grátis até 24h antes.</span>
            </div>
          </v-card>
        </div>
      </v-col>

    </v-row>

    <RentalBookingDialog 
      v-model="showBookingDialog" 
      :car="car" 
      @success="router.push('/meus-alugueis')"
    />

  </v-container>
</template>