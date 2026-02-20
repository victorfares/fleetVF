<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUsers } from '@/composables/useUsers';

import UserFormDialog from '@/components/UserFormDialog.vue';

const router = useRouter();
const {
  users,
  loading,
  totalItems,
  page,
  itemsPerPage,
  search,
  fetchUsers,
  deleteUser,
} = useUsers();

const headers = [
  { title: 'Usuário', key: 'name', align: 'start', minWidth: '250px' },
  { title: 'Perfil de Acesso', key: 'role', align: 'center', minWidth: '150px' },
  { title: 'Data de Cadastro', key: 'createdAt', align: 'center', minWidth: '150px' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end', minWidth: '140px' },
];

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    ADMIN: 'black',
    MANAGER: 'primary',
    CLIENT: 'grey-darken-1',
  };
  return colors[role] || 'grey';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '---';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// --- AÇÕES DA TABELA E MODAL ---

const viewUserRentals = (user: any) => {
  router.push({ path: '/admin/reservas', query: { userId: user.id, search: user.name } });
};

// Variáveis de controle do Modal
const isDialogOpen = ref(false);
const selectedUser = ref<any>(null);

const openCreateDialog = () => {
  selectedUser.value = null; // null significa que é um NOVO usuário
  isDialogOpen.value = true; // Abre a janela
};

const openEditDialog = (user: any) => {
  selectedUser.value = { ...user }; // Passa os dados para o formulário
  isDialogOpen.value = true; // Abre a janela
};

const handleDelete = async (user: any) => {
  if (confirm(`Atenção! Tem certeza que deseja remover o usuário ${user.name}?`)) {
    await deleteUser(user.id);
  }
};

// --- CONTROLE DE TABELA E BUSCA ---
let searchTimeout: any = null;
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchUsers();
  }, 600);
};

const handleTableUpdate = async ({ page: newPage, itemsPerPage: newItemsPerPage }: any) => {
  page.value = newPage;
  itemsPerPage.value = newItemsPerPage;
  await fetchUsers();
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <v-container fluid class="py-8">
    <div class="d-flex flex-wrap justify-space-between align-center mb-6 gap-4">
      <div>
        <h1 class="text-h4 font-weight-black text-black">Gestão de Usuários</h1>
        <p class="text-grey-darken-1 mt-1">Administre os clientes e funcionários da plataforma.</p>
      </div>
      <v-btn 
        color="black" 
        variant="flat" 
        prepend-icon="mdi-account-plus" 
        class="font-weight-bold"
        @click="openCreateDialog"
      >
        Novo Usuário
      </v-btn>
    </div>

    <v-card class="rounded-xl border elevation-2">
      <v-card-title class="pa-4 bg-grey-lighten-4 border-b d-flex align-center">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar por nome ou email..."
          variant="outlined"
          density="compact"
          hide-details
          bg-color="white"
          class="max-w-md"
          @input="onSearchInput"
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-refresh" variant="text" color="black" @click="fetchUsers" :loading="loading"></v-btn>
      </v-card-title>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="users"
        :items-length="totalItems"
        :loading="loading"
        item-value="id"
        hover
        @update:options="handleTableUpdate"
      >
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center py-2">
             <v-avatar color="grey-lighten-3" size="36" class="mr-3 border font-weight-bold text-black">
               {{ item.name?.charAt(0).toUpperCase() || '?' }}
             </v-avatar>
             <div>
               <div class="font-weight-bold text-black text-body-2">{{ item.name }}</div>
               <div class="text-caption text-grey-darken-1">{{ item.email }}</div>
             </div>
          </div>
        </template>

        <template v-slot:item.role="{ item }">
          <v-chip
            :color="getRoleColor(item.role)"
            size="small"
            class="font-weight-black text-uppercase"
            variant="flat"
          >
            {{ item.role === 'CLIENT' ? 'CLIENTE' : item.role === 'MANAGER' ? 'GERENTE' : 'ADMIN' }}
          </v-chip>
        </template>

        <template v-slot:item.createdAt="{ item }">
          <span class="font-weight-bold text-grey-darken-3">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <v-tooltip text="Ver Reservas" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props" 
                  icon="mdi-car-clock" 
                  variant="text" 
                  size="small" 
                  color="black"
                  @click="viewUserRentals(item)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Editar Perfil" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props" 
                  icon="mdi-pencil" 
                  variant="text" 
                  size="small" 
                  color="primary"
                  @click="openEditDialog(item)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Excluir Usuário" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props" 
                  icon="mdi-delete" 
                  variant="text" 
                  size="small" 
                  color="error"
                  @click="handleDelete(item)"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <UserFormDialog 
      v-model="isDialogOpen" 
      :user="selectedUser" 
      @saved="fetchUsers" 
    />

  </v-container>
</template>