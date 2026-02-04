<template>
  <v-container>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Gerenciar Agências</h1>
      </v-col>
      <v-col class="text-right">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog">
          Nova Agência
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="agencies"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate((item as any).createdAt) }}
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Nova Agência</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newAgency.name"
                  label="Nome da Agência"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newAgency.address"
                  label="Endereço Completo"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="newAgency.city"
                  label="Cidade"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newAgency.state"
                  label="UF"
                  maxlength="2"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
            Cancelar
          </v-btn>
          <v-btn color="blue-darken-1" variant="elevated" @click="saveAgency">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

// 1. Definição da Interface (Resolve o erro "property does not exist on type never")
interface Agency {
  id?: number; // Opcional pois na criação ainda não tem ID
  name: string;
  city: string;
  state: string;
  address: string;
  createdAt?: string;
}

// 2. Estado Reativo Tipado
// Aqui dizemos explicitamente que é uma lista de 'Agency'
const agencies = ref<Agency[]>([]); 
const loading = ref(false);
const dialog = ref(false);

// Modelo para o Formulário
const newAgency = ref<Agency>({
  name: '',
  city: '',
  state: '',
  address: ''
});

// Configuração das Colunas (Vuetify)
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nome', key: 'name' },
  { title: 'Cidade', key: 'city' },
  { title: 'UF', key: 'state' },
  { title: 'Endereço', key: 'address' },
  { title: 'Criado em', key: 'createdAt' },
];

// --- Métodos ---

// Função auxiliar para formatar data sem poluir o template
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
    console.error('Erro ao buscar agências:', error);
    alert('Erro de conexão com o servidor.');
  } finally {
    loading.value = false;
  }
};

const saveAgency = async () => {
  if (!newAgency.value.name || !newAgency.value.address) {
    alert('Preencha pelo menos Nome e Endereço.');
    return;
  }

  try {
    await api.post('/agencies', newAgency.value);
    
    // Sucesso: fecha, limpa e recarrega
    dialog.value = false;
    newAgency.value = { name: '', city: '', state: '', address: '' };
    await fetchAgencies();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar agência.');
  }
};

onMounted(() => {
  fetchAgencies();
});
</script>