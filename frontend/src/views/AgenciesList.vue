<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAgencies } from '@/composables/useAgencies';
import AgencyCard from '@/components/AgencyCard.vue';
import type { Agency } from '@/types/Agency';

const router = useRouter();
const { agencies, loading, fetchAgencies } = useAgencies();

const handleViewFleet = (agency: Agency) => {
  router.push({ path: '/frota', query: { agencyId: agency.id } });
};

onMounted(() => {
  fetchAgencies();
});
</script>

<template>
  <v-container fluid class="fill-height align-start bg-grey-lighten-5 pa-0">
    
    <v-sheet color="white" class="w-100 py-10 px-6 border-b mb-8">
      <v-container>
        <h1 class="text-h4 font-weight-black text-grey-darken-4 mb-2">Nossas Agências</h1>
        <p class="text-body-1 text-grey-darken-1">
          Encontre o ponto de retirada mais próximo de você e confira os carros disponíveis.
        </p>
      </v-container>
    </v-sheet>

    <v-container class="px-4 px-md-8">
      
      <v-row v-if="loading">
        <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="article" class="rounded-lg border bg-white"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else-if="agencies.length === 0">
        <v-col cols="12" class="text-center mt-10">
          <v-icon icon="mdi-office-building-marker-outline" size="64" color="grey-lighten-1"></v-icon>
          <h3 class="text-h6 text-grey mt-4">Nenhuma agência encontrada.</h3>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col 
          v-for="agency in agencies" 
          :key="agency.id" 
          cols="12" sm="6" md="4" lg="3"
        >
          <AgencyCard 
            :agency="agency" 
            :is-public="true"
            @view-fleet="handleViewFleet"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>