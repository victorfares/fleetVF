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
        <v-card elevation="0" class="rounded-xl overflow-hidden bg-grey-lighten-5 mb-6 border">
          <v-img 
            :src="car.imageUrl || 'https://via.placeholder.com/800x600?text=Sem+Imagem'" 
            height="500" 
            cover 
            class="align-end"
          >
            <v-chip 
              v-if="car.status !== 'AVAILABLE'"
              color="error" 
              class="ma-4 font-weight-black text-uppercase elevation-4"
              size="large"
            >
              Indisponível
            </v-chip>
          </v-img>
        </v-card>

        <h2 class="text-h5 font-weight-black mb-4 text-black">Especificações do Veículo</h2>
        <v-row>
          <v-col cols="6" sm="4" md="4" v-for="(spec, i) in specs" :key="i">
            <v-card variant="outlined" class="py-4 px-2 text-center rounded-lg border-opacity-25" color="grey">
              <v-icon :icon="spec.icon" size="large" color="amber-darken-2" class="mb-2"></v-icon>
              <div class="text-caption text-grey-darken-1 font-weight-bold text-uppercase">{{ spec.label }}</div>
              <div class="text-body-1 font-weight-black text-black">{{ spec.value }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-8"></v-divider>

        <h2 class="text-h5 font-weight-black mb-3 text-black">Sobre este carro</h2>
        <p class="text-body-1 text-grey-darken-2" style="line-height: 1.8;">
          Este <strong>{{ car.brand }} {{ car.model }}</strong> é a escolha perfeita para quem busca conforto e desempenho. 
          Situado na agência <strong>{{ car.agency?.name }}</strong>, localizada em <strong>{{ car.agency?.address }} ({{ car.agency?.city }} - {{ car.agency?.state }})</strong>, ele conta com manutenção em dia 
          e higienização completa antes de cada locação. Ideal para viagens em família ou compromissos executivos.
        </p>
      </v-col>

      <v-col cols="12" md="5" lg="4">
        <div class="position-sticky" style="top: 100px;">
          <v-card elevation="12" class="rounded-xl pa-6 bg-white border">
            
            <div class="mb-4">
              <span class="text-caption font-weight-bold text-grey-darken-1 text-uppercase">{{ car.brand }}</span>
              <h1 class="text-h4 font-weight-black text-black">{{ car.model }}</h1>
            </div>

            <div class="d-flex align-start mb-6 bg-grey-lighten-4 pa-4 rounded-lg border">
              <v-icon icon="mdi-map-marker" size="small" color="amber-darken-2" class="mr-3 mt-1"></v-icon>
              <div>
                <span class="text-body-2 font-weight-black text-black d-block mb-1">{{ car.agency?.name }}</span>
                <span class="text-caption text-grey-darken-3 d-block font-weight-medium">{{ car.agency?.address }}</span>
                <span class="text-caption text-grey-darken-2 d-block font-weight-bold">{{ car.agency?.city }} - {{ car.agency?.state }}</span>
              </div>
            </div>

            <v-divider class="mb-6"></v-divider>

            <div class="d-flex align-end justify-space-between mb-4">
              <span class="text-body-1 text-grey-darken-3 font-weight-bold">Diária a partir de</span>
              <div class="text-right">
                <span class="text-h4 font-weight-black text-black">{{ formatCurrency(Number(car.dailyRate)) }}</span>
                <span class="text-caption text-grey-darken-1 font-weight-bold d-block">/ dia</span>
              </div>
            </div>

            <v-sheet color="amber-lighten-5" class="pa-4 rounded-lg mb-6 d-flex align-center border border-amber-lighten-3">
              <v-icon icon="mdi-shield-check" color="amber-darken-3" class="mr-3"></v-icon>
              <span class="text-caption text-amber-darken-4 font-weight-bold" style="line-height: 1.3;">
                Seguro básico e Proteção contra terceiros inclusos no valor.
              </span>
            </v-sheet>

            <v-btn 
              block 
              color="amber-darken-1" 
              size="x-large" 
              class="font-weight-black text-black rounded-lg mb-3"
              height="56"
              elevation="4"
              :disabled="car.status !== 'AVAILABLE'"
              @click="showBookingDialog = true"
            >
              {{ car.status === 'AVAILABLE' ? 'RESERVAR AGORA' : 'INDISPONÍVEL' }}
            </v-btn>

            <div class="text-center">
              <span class="text-caption font-weight-bold text-grey-darken-1">Cancelamento grátis até 24h antes.</span>
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