<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAgencies } from '@/composables/useAgencies';
import type { Agency } from '@/types/Agency';
import AgencyFormDialog from '@/components/AgencyFormDialog.vue';

// 1. Uso do Composable (Lógica separada)
const { 
  agencies, 
  loading, 
  totalItems, 
  page, 
  itemsPerPage, 
  search, 
  fetchAgencies, 
  deleteAgency 
} = useAgencies();

// 2. Estado Local (Dialogs e UI)
const isDialogOpen = ref(false);
const agencyToEdit = ref<Agency | null>(null);
const deleteLoading = ref<string | null>(null);

// 3. Configuração da Tabela
const headers = [
  { title: 'Nome da Agência', key: 'name', align: 'start' },
  { title: 'Cidade / UF', key: 'location', sortable: false },
  { title: 'Endereço', key: 'address', sortable: false },
  { title: 'ID', key: 'id', align: 'start', sortable: false }, // Opcional, bom para debug
  { title: 'Ações', key: 'actions', sortable: false, align: 'end' },
] as const;

// 4. Ações
const openNewAgency = () => {
  agencyToEdit.value = null;
  isDialogOpen.value = true;
};

const openEditAgency = (agency: Agency) => {
  agencyToEdit.value = agency;
  isDialogOpen.value = true;
};

const handleDelete = async (agency: Agency) => {
  if (!confirm(`Tem certeza que deseja excluir a agência ${agency.name}?`)) return;

  deleteLoading.value = agency.id;
  try {
    await deleteAgency(agency.id);
  } catch (error) {
    alert('Erro ao excluir agência. Verifique se não há carros vinculados.');
  } finally {
    deleteLoading.value = null;
  }
};

const onAgencySaved = () => {
  fetchAgencies();
  isDialogOpen.value = false;
};

// 5. Watchers (Paginação e Busca)
watch([page, itemsPerPage], () => {
  fetchAgencies();
});

let searchTimeout: ReturnType<typeof setTimeout>;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchAgencies();
  }, 600);
});

// Carga Inicial
fetchAgencies();
</script>

<template>
  <v-container fluid class="fill-height align-start pa-0 bg-grey-lighten-5">
    <v-container class="pa-4 pa-md-8">
      
      <div class="d-flex flex-wrap justify-space-between align-center mb-6 gap-4">
        <div>
          <h1 class="text-h4 font-weight-black text-grey-darken-4">Gestão de Agências</h1>
          <p class="text-body-2 text-grey">Administre os pontos de retirada e devolução.</p>
        </div>
        <v-btn 
          color="black" 
          prepend-icon="mdi-plus" 
          size="large" 
          elevation="2"
          class="font-weight-bold"
          @click="openNewAgency"
        >
          Nova Agência
        </v-btn>
      </div>

      <v-card elevation="1" rounded="lg" class="border">
        
        <v-card-title class="d-flex align-center py-4 px-6">
          <v-icon icon="mdi-office-building-cog" class="mr-2 text-grey"></v-icon>
          <span class="text-subtitle-1 font-weight-bold">Agências Parceiras</span>
          
          <v-spacer></v-spacer>
          
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            label="Buscar agência..."
            prepend-inner-icon="mdi-magnify"
            single-line
            hide-details
            class="max-width-300"
            style="max-width: 300px"
          ></v-text-field>
        </v-card-title>

        <v-divider></v-divider>

        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="headers"
          :items="agencies"
          :items-length="totalItems"
          :loading="loading"
          item-value="id"
          hover
          class="rounded-0"
        >
          <template v-slot:item.name="{ item }">
            <div class="font-weight-bold text-body-2">{{ item.name }}</div>
          </template>

          <template v-slot:item.location="{ item }">
            <v-chip size="small" variant="tonal" color="primary" class="font-weight-medium">
              {{ item.city }} - {{ item.state }}
            </v-chip>
          </template>
          
          <template v-slot:item.id="{ item }">
             <span class="text-caption text-grey">{{ item.id.slice(0, 8) }}...</span>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="d-flex justify-end">
              <v-tooltip text="Editar" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn 
                    v-bind="props"
                    icon="mdi-pencil" 
                    variant="text" 
                    size="small" 
                    color="primary"
                    @click="openEditAgency(item)"
                  ></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="Excluir" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn 
                    v-bind="props"
                    icon="mdi-delete" 
                    variant="text" 
                    size="small" 
                    color="error"
                    :loading="deleteLoading === item.id"
                    @click="handleDelete(item)"
                  ></v-btn>
                </template>
              </v-tooltip>
            </div>
          </template>

          <template v-slot:no-data>
            <div class="pa-8 text-center">
              <v-icon icon="mdi-domain-off" size="40" color="grey-lighten-1" class="mb-2"></v-icon>
              <p class="text-grey">Nenhuma agência encontrada.</p>
              <v-btn variant="text" color="primary" @click="openNewAgency" class="mt-2">
                Cadastrar a primeira
              </v-btn>
            </div>
          </template>

        </v-data-table-server>
      </v-card>
    </v-container>

    <AgencyFormDialog 
      v-model="isDialogOpen" 
      :agency-to-edit="agencyToEdit" 
      @saved="onAgencySaved" 
    />

  </v-container>
</template>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
</style>