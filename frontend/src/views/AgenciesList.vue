<template>
  <v-container>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h4 font-weight-bold text-primary">Gerenciar Agências</h1>
        <p class="text-body-1 text-grey">Visualize e cadastre suas unidades.</p>
      </v-col>
      <v-col class="text-right">
        <v-btn color="secondary" prepend-icon="mdi-plus" size="large" @click="dialog = true">
          Nova Agência
        </v-btn>
      </v-col>
    </v-row>

    <v-card elevation="2" variant="elevated" class="bg-white border-0">
      <v-data-table
        :headers="headers"
        :items="agencies"
        :loading="loading"
        hover
      >
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate((item as any).createdAt) }}
        </template>
      </v-data-table>
    </v-card>

    <AgencyFormDialog v-model="dialog" @saved="fetchAgencies" />
    
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import AgencyFormDialog from '@/components/AgencyFormDialog.vue'; // <--- Importamos o novo componente

// Interface (Idealmente moveríamos para src/types/Agency.ts depois)
interface Agency {
  id?: number;
  name: string;
  city: string;
  state: string;
  address: string;
  createdAt?: string;
}

// Estado
const agencies = ref<Agency[]>([]);
const loading = ref(false);
const dialog = ref(false); // Variável simples que abre/fecha o modal

const headers = [
  { title: 'ID', key: 'id', align: 'start' as const },
  { title: 'Nome', key: 'name' },
  { title: 'Cidade', key: 'city' },
  { title: 'UF', key: 'state' },
  { title: 'Endereço', key: 'address' },
  { title: 'Data Criação', key: 'createdAt' },
];

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const fetchAgencies = async () => {
  loading.value = true;
  try {
    const response = await api.get('/agencies');
    agencies.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAgencies();
});
</script>