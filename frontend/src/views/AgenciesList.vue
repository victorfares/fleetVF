<template>
  <v-container>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h4 font-weight-bold text-primary">Gerenciar Agências</h1>
        <p class="text-body-1 text-grey">Visualize e cadastre suas unidades.</p>
      </v-col>
      <v-col class="text-right">
        <v-btn color="secondary" prepend-icon="mdi-plus" size="large" @click="openDialog">
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

    <v-dialog v-model="dialog" max-width="600px" transition="dialog-bottom-transition">
      
      <v-card 
        theme="light" 
        color="white" 
        elevation="24" 
        rounded="xl" 
        variant="flat"
        class="bg-white"
      >
        
        <v-toolbar color="secondary" class="px-4">
          <v-toolbar-title class="text-h6 font-weight-bold text-white">
            <v-icon icon="mdi-office-building-plus" class="mr-2"></v-icon>
            Nova Agência
          </v-toolbar-title>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pt-6">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newAgency.name"
                  label="Nome da Agência"
                  placeholder="Ex: FleetVF Matriz"
                  variant="outlined"
                  base-color="black"
                  color="primary"
                  bg-color="white"
                  class="text-high-emphasis"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newAgency.address"
                  label="Endereço Completo"
                  placeholder="Rua, Número, Bairro"
                  variant="outlined"
                  base-color="black"
                  color="primary"
                  bg-color="white"
                  class="text-high-emphasis"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="newAgency.city"
                  label="Cidade"
                  variant="outlined"
                  base-color="black"
                  color="primary"
                  bg-color="white"
                  class="text-high-emphasis"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newAgency.state"
                  label="UF"
                  maxlength="2"
                  variant="outlined"
                  base-color="black"
                  color="primary"
                  bg-color="white"
                  class="text-high-emphasis"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey-darken-3" 
            variant="text" 
            size="large" 
            @click="dialog = false"
            class="mr-2 font-weight-bold"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="secondary" 
            variant="elevated" 
            size="large" 
            @click="saveAgency"
            elevation="4"
            class="font-weight-bold"
          >
            Salvar Agência
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

interface Agency {
  id?: number;
  name: string;
  city: string;
  state: string;
  address: string;
  createdAt?: string;
}

const agencies = ref<Agency[]>([]); 
const loading = ref(false);
const dialog = ref(false);

const newAgency = ref<Agency>({
  name: '',
  city: '',
  state: '',
  address: ''
});

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

const openDialog = () => {
  dialog.value = true;
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

const saveAgency = async () => {
  if (!newAgency.value.name || !newAgency.value.address) {
    alert('Preencha Nome e Endereço.');
    return;
  }

  try {
    await api.post('/agencies', newAgency.value);
    dialog.value = false;
    newAgency.value = { name: '', city: '', state: '', address: '' };
    await fetchAgencies();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar.');
  }
};

onMounted(() => {
  fetchAgencies();
});
</script>