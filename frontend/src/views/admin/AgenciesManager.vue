<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAgencies } from '@/composables/useAgencies';
import type { Agency } from '@/types/Agency';
import { useAlertStore } from '@/stores/alert';
import AgencyFormDialog from '@/components/AgencyFormDialog.vue';

const {
  agencies,
  loading,
  totalItems,
  page,
  itemsPerPage,
  fetchAgencies,
  deleteAgency,
} = useAgencies();

const alertStore = useAlertStore();


// Estado Local (Dialogs e UI)
const isDialogOpen = ref(false);
const agencyToEdit = ref<Agency | null>(null);
const deleteLoading = ref<string | null>(null);

const headers: any = [
  { title: 'Nome da Agência', key: 'name', align: 'start' },
  { title: 'Cidade / UF', key: 'location', sortable: false },
  { title: 'Endereço', key: 'address', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end' },
];

// Ações
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
    alertStore.showError(
      'Erro ao excluir agência. Verifique se não há carros vinculados.'
    );
  } finally {
    deleteLoading.value = null;
  }
};

const onAgencySaved = () => {
  fetchAgencies();
  isDialogOpen.value = false;
};

// Watcher apenas para Paginação
watch([page, itemsPerPage], () => {
  fetchAgencies();
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

      <v-card elevation="2" rounded="lg" class="border">
        
        <v-card-title class="d-flex align-center py-4 px-6 bg-grey-lighten-4 border-bottom">
          <v-icon icon="mdi-office-building-cog" class="mr-3 text-primary"></v-icon>
          <span class="text-h6 font-weight-bold text-grey-darken-4">Lista de Agências Parceiras</span>
          <v-spacer></v-spacer>
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
          class="custom-table rounded-0"
        >
          <template v-slot:item.name="{ item }">
            <div class="font-weight-bold text-body-1 text-grey-darken-4">{{ item.name }}</div>
          </template>

          <template v-slot:item.location="{ item }">
            <v-chip size="default" variant="tonal" color="primary" class="font-weight-medium">
              <v-icon start icon="mdi-map-marker-outline" size="small"></v-icon>
              {{ item.city }} - {{ item.state }}
            </v-chip>
          </template>
          
          <template v-slot:item.address="{ item }">
            <span class="text-body-2 text-grey-darken-2">{{ item.address }}</span>
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
                    class="mr-1"
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
            <div class="pa-10 text-center">
              <v-icon icon="mdi-domain-off" size="50" color="grey-lighten-2" class="mb-4"></v-icon>
              <h3 class="text-h6 text-grey-darken-1 mb-2">Nenhuma agência encontrada</h3>
              <p class="text-body-2 text-grey mb-4">Comece adicionando seu primeiro ponto de retirada.</p>
              <v-btn variant="flat" color="primary" @click="openNewAgency" prepend-icon="mdi-plus">
                Cadastrar Agência
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
