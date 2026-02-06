<template>
  <v-container fluid class="bg-grey-lighten-4 fill-height align-start pa-0">
    <v-toolbar color="white" elevation="1" class="px-md-8">
      <v-toolbar-title class="text-h6 font-weight-bold text-primary">
        Agências Parceiras
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn 
        prepend-icon="mdi-plus" 
        color="primary" 
        variant="flat"
        @click="openCreateDialog"
      >
        Nova Agência
      </v-btn>
    </v-toolbar>

    <v-container class="py-8 px-4 px-md-8">
      <v-row v-if="loading">
        <v-col cols="12" sm="6" md="4" lg="3" v-for="n in 4" :key="n">
          <v-skeleton-loader type="article" class="rounded-lg border"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else-if="agencies.length === 0">
        <v-col cols="12" class="text-center mt-10">
          <v-icon icon="mdi-office-building-off" size="64" color="grey-lighten-1"></v-icon>
          <h3 class="text-body-1 text-grey mt-2">Nenhuma agência encontrada.</h3>
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
            @edit="openEditDialog"
          />
        </v-col>
      </v-row>

      <v-row v-if="pageCount > 1" class="mt-6">
        <v-col cols="12">
          <v-pagination
            v-model="page"
            :length="pageCount"
            color="primary"
            rounded="circle"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>

    <AgencyFormDialog 
      v-model="isDialogOpen"
      :agency-to-edit="selectedAgency"
      @saved="onAgencySaved"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';
import AgencyCard from '@/components/AgencyCard.vue';
import AgencyFormDialog from '@/components/AgencyFormDialog.vue';
import { usePagination } from '@/composables/usePagination';
import type { Agency } from '@/types/Agency';

const agencies = ref<Agency[]>([]);
const loading = ref(true);
const isDialogOpen = ref(false);
const selectedAgency = ref<Agency | null>(null);

const { page, itemsPerPage, totalItems, pageCount, offset } = usePagination(8);

const fetchAgencies = async () => {
  loading.value = true;
  try {
    const response = await api.get('/agencies', {
      params: { limit: itemsPerPage.value, offset: offset.value }
    });
    const apiResponse = response.data.data;
    agencies.value = apiResponse.data;
    totalItems.value = apiResponse.count;
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  selectedAgency.value = null;
  isDialogOpen.value = true;
};

const openEditDialog = (agency: Agency) => {
  selectedAgency.value = agency;
  isDialogOpen.value = true;
};

const onAgencySaved = () => {
  fetchAgencies();
};

watch(page, () => {
  fetchAgencies();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

onMounted(() => {
  fetchAgencies();
});
</script>