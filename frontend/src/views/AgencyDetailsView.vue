<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAgencies } from '@/composables/useAgencies';
import { useCars } from '@/composables/useCars';
import CarCard from '@/components/CarCard.vue';

const route = useRoute();
const router = useRouter();

const { agency, fetchAgencyById, loading: loadingAgency } = useAgencies();
const { cars, fetchCars, loading: loadingCars } = useCars();

onMounted(async () => {
  const agencyId = route.params.id as string;
  await fetchAgencyById(agencyId);
  if (agencyId) {
    fetchCars({ agencyId: agencyId });
  }
});
</script>

<template>
  <v-container class="py-8">
    
    <v-btn 
      variant="text" 
      prepend-icon="mdi-arrow-left" 
      class="mb-4 text-black font-weight-bold" 
      @click="router.back()"
    >
      Voltar
    </v-btn>

    <v-skeleton-loader v-if="loadingAgency" type="article" class="mb-8 rounded-xl"></v-skeleton-loader>

    <v-card v-else-if="agency" elevation="0" class="bg-grey-lighten-4 rounded-xl pa-8 mb-10 border">
      <v-row align="center">
        <v-col cols="12" md="8">
          <div class="d-flex align-center mb-2">
            <v-icon icon="mdi-office-building-marker" color="black" size="large" class="mr-3"></v-icon>
            <span class="text-overline font-weight-bold text-black">Agência Oficial FleetVF</span>
          </div>
          
          <h1 class="text-h3 font-weight-black text-black mb-4">{{ agency.name }}</h1>
          
          <div class="d-flex align-start text-body-1 text-black">
            <v-icon icon="mdi-map-marker" color="error" class="mr-2 mt-1"></v-icon>
            <div>
              <div class="font-weight-bold">{{ agency.address }}</div>
              <div class="text-grey-darken-3 font-weight-medium">{{ agency.city }} - {{ agency.state }}</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="4" class="text-md-right">
          <v-card variant="outlined" class="pa-4 bg-white rounded-lg d-inline-block text-left border-opacity-25" style="border-color: black !important;">
            <div class="d-flex align-center mb-3">
              <v-icon icon="mdi-clock-outline" class="mr-2" color="black"></v-icon>
              <span class="text-caption font-weight-black text-uppercase text-black">Horário de Funcionamento</span>
            </div>
            <div class="font-weight-bold text-black text-body-2">Seg - Sex: 08:00 às 18:00</div>
            <div class="font-weight-bold text-black text-body-2">Sáb: 08:00 às 12:00</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 font-weight-bold text-black">Veículos disponíveis nesta unidade</h2>
      <v-chip color="black" variant="flat" size="small" class="font-weight-bold">
        {{ cars.length }} carros encontrados
      </v-chip>
    </div>

    <v-row v-if="loadingCars">
      <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="4">
        <v-skeleton-loader type="image, article" class="rounded-xl border"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-else-if="!cars.length">
      <v-col cols="12" class="text-center py-16 bg-grey-lighten-5 rounded-xl border-dashed">
        <v-icon icon="mdi-car-off" size="64" color="grey" class="mb-4"></v-icon>
        <h3 class="text-h6 text-grey-darken-1">Nenhum veículo disponível nesta agência no momento.</h3>
        <v-btn color="black" variant="text" to="/frota" class="mt-2 font-weight-bold">Ver frota geral</v-btn>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="car in cars" :key="car.id" cols="12" sm="6" md="4">
        <CarCard :car="car" />
      </v-col>
    </v-row>

  </v-container>
</template>