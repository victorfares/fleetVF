<script setup lang="ts">
import { useFormatters } from '@/composables/useFormatters';

defineProps<{
  item: any;
  isLate: (rental: any) => boolean;
}>();

const { formatCurrency, formatDate } = useFormatters();
</script>

<template>
  <v-row class="bg-grey-lighten-4 pa-4 rounded-lg ma-0">
    <v-col cols="12" md="7">
      <v-card variant="flat" class="bg-white h-100 border rounded-lg">
        <v-card-title class="text-subtitle-2 font-weight-black text-black d-flex align-center pt-4 text-uppercase letter-spacing-1">
          <v-icon icon="mdi-map-marker-path" class="mr-3" color="grey-darken-3"></v-icon>
          Detalhes de Logística
        </v-card-title>
        <v-divider class="my-2 border-opacity-15"></v-divider>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <div class="d-flex align-start">
                <v-icon icon="mdi-map-marker-radius" color="success" class="mr-3 mt-1"></v-icon>
                <div>
                  <span class="text-caption text-grey-darken-1 font-weight-black text-uppercase d-block mb-1">Retirada</span>
                  <div class="text-body-1 font-weight-black text-black">{{ item.pickupAgency?.name || 'N/A' }}</div>
                  
                  <div class="text-body-2 text-grey-darken-3 mt-1">
                    {{ item.pickupAgency?.address }}
                  </div>
                  <div class="text-caption font-weight-medium text-grey-darken-2">
                    {{ item.pickupAgency?.city }} - {{ item.pickupAgency?.state }}
                  </div>

                  <div class="mt-2 text-caption font-weight-bold text-success border-s-4 pl-2 border-success">
                    Data: {{ formatDate(item.startDate) }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="d-flex align-start">
                <v-icon icon="mdi-flag-checkered" color="error" class="mr-3 mt-1"></v-icon>
                <div>
                  <span class="text-caption text-grey-darken-1 font-weight-black text-uppercase d-block mb-1">Devolução</span>
                  <div class="text-body-1 font-weight-black text-black">{{ item.returnAgency?.name || 'N/A' }}</div>
                  
                  <div class="text-body-2 text-grey-darken-3 mt-1">
                    {{ item.returnAgency?.address }}
                  </div>
                  <div class="text-caption font-weight-medium text-grey-darken-2">
                    {{ item.returnAgency?.city }} - {{ item.returnAgency?.state }}
                  </div>

                  <div class="mt-2 text-caption font-weight-bold text-error border-s-4 pl-2 border-error">
                    Previsto: {{ formatDate(item.endDate) }}
                  </div>

                  <div v-if="item.realReturnDate" class="mt-2">
                    <v-chip size="x-small" :color="isLate(item) ? 'error' : 'success'" variant="flat" class="font-weight-bold">
                      Entregue em: {{ formatDate(item.realReturnDate) }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="5">
      <v-card variant="flat" class="bg-white h-100 border rounded-lg">
        <v-card-title class="text-subtitle-2 font-weight-black text-black d-flex align-center pt-4 text-uppercase letter-spacing-1">
          <v-icon icon="mdi-cash-multiple" class="mr-3" color="grey-darken-3"></v-icon>
          Resumo Financeiro
        </v-card-title>
        <v-divider class="my-2 border-opacity-15"></v-divider>
        <v-card-text>
          <div class="d-flex justify-space-between mb-2 align-center">
            <span class="text-body-2 text-grey-darken-3 font-weight-medium">Diária Base</span>
            <span class="text-body-1 font-weight-bold text-black">{{ formatCurrency(item.dailyRateSnapshot) }}</span>
          </div>
          
          <div class="d-flex justify-space-between mb-2 align-center" v-if="item.status === 'COMPLETED'">
             <span class="text-body-2 text-grey-darken-3 font-weight-medium">KM Percorrida</span>
             <span class="text-body-2 font-weight-bold text-black">
                {{ (item.endMileage - item.startMileage) }} KM
             </span>
          </div>

          <div v-if="isLate(item)" class="py-2 px-3 bg-red-lighten-5 rounded border border-error mb-3 mt-2">
             <div class="d-flex align-center text-red-darken-4">
                <v-icon icon="mdi-clock-alert" size="small" class="mr-2"></v-icon>
                <span class="font-weight-black text-caption">MULTA POR ATRASO APLICADA</span>
             </div>
          </div>

          <v-divider class="my-4 border-dashed border-opacity-100"></v-divider>
          
          <div class="d-flex justify-space-between align-center">
            <span class="text-subtitle-1 font-weight-black text-grey-darken-4">TOTAL ESTIMADO</span>
            <span class="text-h5 font-weight-black text-primary">{{ formatCurrency(item.totalValue) }}</span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>