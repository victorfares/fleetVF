<template>
  <v-container fluid class="pa-0">
    <v-sheet
      color="surface-variant"
      class="d-flex flex-column align-center justify-center text-center pa-10"
      min-height="400"
    >
      <v-icon icon="mdi-steering" size="80" color="primary" class="mb-4"></v-icon>
      <h1 class="text-h2 font-weight-bold mb-4">Bem-vindo ao FleetVF</h1>
      <p class="text-h5 mb-6 text-medium-emphasis">
        A solução completa para o gerenciamento inteligente da sua frota de veículos.
      </p>
      
      <div class="d-flex gap-4">
        <v-btn
          color="primary"
          size="x-large"
          prepend-icon="mdi-domain"
          to="/agencias"
          class="mr-4"
        >
          Gerenciar Agências
        </v-btn>
        
        <v-btn
          variant="outlined"
          size="x-large"
          prepend-icon="mdi-github"
          href="https://github.com/victorfares"
          target="_blank"
        >
          Ver Repositório
        </v-btn>
      </div>
    </v-sheet>

    <v-container class="mt-n10">
      <v-row>
        <v-col cols="12" md="4">
          <v-card elevation="4" class="h-100">
            <v-card-item>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-domain" color="blue" class="mr-2"></v-icon>
                Agências
              </v-card-title>
            </v-card-item>
            <v-card-text>
              Cadastre e gerencie suas filiais. Controle de endereço, localização e frota alocada por unidade.
            </v-card-text>
            <v-card-actions>
              <v-btn variant="text" color="blue" to="/agencias">Acessar</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="4" class="h-100">
            <v-card-item>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-car-hatchback" color="green" class="mr-2"></v-icon>
                Frota (Em Breve)
              </v-card-title>
            </v-card-item>
            <v-card-text>
              Controle total dos veículos. Marca, modelo, placa, manutenção e disponibilidade em tempo real.
            </v-card-text>
            <v-card-actions>
              <v-btn variant="text" color="grey">Em desenvolvimento</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="4" class="h-100">
            <v-card-item>
              <v-card-title class="d-flex align-center">
                <v-icon icon="mdi-chart-line" color="orange" class="mr-2"></v-icon>
                Dashboards
              </v-card-title>
            </v-card-item>
            <v-card-text>
              Visualize métricas de desempenho, carros mais alugados e faturamento por agência.
            </v-card-text>
            <v-card-actions>
              <v-btn variant="text" color="grey">Em desenvolvimento</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
</script>