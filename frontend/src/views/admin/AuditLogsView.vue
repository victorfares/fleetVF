<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAudit } from '@/composables/useAudit';

const { logs, loading, fetchLogs } = useAudit();

const search = ref('');
const expanded = ref([]);

const headers = [
  { title: 'Data / Hora', key: 'createdAt', width: '180px' },
  { title: 'Usuário', key: 'userEmail', minWidth: '200px' },
  { title: 'Ação', key: 'action', align: 'center' },
  { title: 'Módulo', key: 'entityName' },
  { title: 'ID do Registro', key: 'entityId' },
  { title: 'Detalhes', key: 'data-table-expand' },
];

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    CREATE: 'success',
    UPDATE: 'info',
    DELETE: 'error',
    CHECK_IN: 'primary',
    FINALIZE: 'deep-purple',
  };
  return colors[action] || 'grey';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    day: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
};

onMounted(() => {
  fetchLogs();
});
</script>

<template>
  <v-container fluid class="py-8">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-black text-black">Logs de Auditoria</h1>
        <p class="text-grey-darken-1 mt-1">Rastreabilidade completa de ações no sistema.</p>
      </div>
      <v-btn color="black" variant="flat" prepend-icon="mdi-refresh" @click="fetchLogs" :loading="loading">
        Atualizar
      </v-btn>
    </div>

    <v-card class="rounded-xl border elevation-2">
      <v-card-title class="pa-4 bg-grey-lighten-4 border-b">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar por usuário, módulo ou ID..."
          variant="outlined"
          density="compact"
          hide-details
          bg-color="white"
          class="max-w-md"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        v-model:expanded="expanded"
        :headers="headers"
        :items="logs"
        :search="search"
        :loading="loading"
        item-value="id"
        show-expand
        hover
      >
        <template v-slot:item.createdAt="{ item }">
          <div class="d-flex flex-column py-2">
            <span class="font-weight-bold text-body-2 text-black">{{ formatDate(item.createdAt).day }}</span>
            <span class="text-caption text-grey-darken-1">{{ formatDate(item.createdAt).time }}</span>
          </div>
        </template>

        <template v-slot:item.userEmail="{ item }">
          <div class="d-flex align-center">
             <v-avatar color="grey-lighten-3" size="32" class="mr-3 border">
               <v-icon icon="mdi-account" size="small" color="grey-darken-3"></v-icon>
             </v-avatar>
             <span class="font-weight-medium text-black">{{ item.userEmail || 'Sistema' }}</span>
          </div>
        </template>

        <template v-slot:item.action="{ item }">
          <v-chip
            :color="getActionColor(item.action)"
            size="small"
            class="font-weight-black text-uppercase"
            variant="flat"
          >
            {{ item.action }}
          </v-chip>
        </template>

        <template v-slot:item.entityName="{ item }">
          <span class="font-weight-bold text-grey-darken-3">{{ item.entityName }}</span>
        </template>

        <template v-slot:item.entityId="{ item }">
          <span class="text-caption text-grey text-truncate d-inline-block" style="max-width: 120px;" :title="item.entityId">
            {{ item.entityId }}
          </span>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="bg-grey-lighten-4 pa-6 border-b">
              <v-row>
                <v-col cols="12" md="6" v-if="item.oldValues">
                  <v-card variant="outlined" class="bg-red-lighten-5 border-error h-100 rounded-lg">
                    <v-card-title class="text-subtitle-2 text-red-darken-4 font-weight-black pt-3">
                      <v-icon icon="mdi-minus-box" class="mr-2"></v-icon> Estado Anterior
                    </v-card-title>
                    <v-divider class="border-error opacity-20"></v-divider>
                    <v-card-text class="pa-0">
                      <pre class="pa-4 text-caption text-black font-weight-bold" style="white-space: pre-wrap; word-wrap: break-word;">{{ JSON.stringify(item.oldValues, null, 2) }}</pre>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6" v-if="item.newValues">
                  <v-card variant="outlined" class="bg-green-lighten-5 border-success h-100 rounded-lg">
                    <v-card-title class="text-subtitle-2 text-green-darken-4 font-weight-black pt-3">
                      <v-icon icon="mdi-plus-box" class="mr-2"></v-icon> Novo Estado
                    </v-card-title>
                    <v-divider class="border-success opacity-20"></v-divider>
                    <v-card-text class="pa-0">
                      <pre class="pa-4 text-caption text-black font-weight-bold" style="white-space: pre-wrap; word-wrap: break-word;">{{ JSON.stringify(item.newValues, null, 2) }}</pre>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" v-if="!item.oldValues && !item.newValues">
                   <p class="text-black font-weight-bold text-center my-4">Nenhum detalhe de dados registrado para esta ação.</p>
                </v-col>
              </v-row>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>