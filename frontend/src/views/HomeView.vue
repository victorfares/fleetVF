<template>
  <v-container fluid class="pa-0">
    
    <v-container class="pt-10 pt-md-16 pb-16">
      <v-row align="center" justify="center">
        <v-col cols="12" md="7" class="text-center text-md-left">
          <v-chip color="secondary" variant="tonal" size="small" class="mb-6 font-weight-bold">
            V 2.0 AGORA DISPONÍVEL
          </v-chip>
          
          <h1 class="text-h3 text-md-h2 font-weight-bold text-primary mb-6" style="line-height: 1.2;">
            Controle total da sua <br>
            <span class="text-secondary">frota corporativa</span>
          </h1>
          
          <p class="text-h6 text-grey-darken-1 mb-8 font-weight-regular" style="max-width: 600px; margin: 0 auto 0 0;">
            A solução completa para o gerenciamento inteligente de veículos e agências. Otimize custos, monitore ativos e escale sua operação com o <strong>FleetVF</strong>.
          </p>
          
          <div class="d-flex flex-column flex-sm-row gap-4 justify-center justify-md-start">
            <v-btn color="secondary" size="x-large" elevation="4" to="/agencias" class="px-8 text-white">
              Começar Agora
              <v-icon end icon="mdi-arrow-right" class="ml-2"></v-icon>
            </v-btn>
            
            <v-btn variant="outlined" color="primary" size="x-large" class="px-8 mt-3 mt-sm-0" href="https://github.com/victorfares" target="_blank">
              Ver Repositório
            </v-btn>
          </div>

          <div class="mt-10 d-flex align-center justify-center justify-md-start text-grey">
            <v-icon icon="mdi-check-circle-outline" size="small" class="mr-1"></v-icon>
            <span class="text-body-2 mr-4">Open Source</span>
            <v-icon icon="mdi-check-circle-outline" size="small" class="mr-1"></v-icon>
            <span class="text-body-2">Vue 3 Powered</span>
          </div>
        </v-col>

        <v-col cols="12" md="5" class="d-none d-md-flex justify-center position-relative">
           <v-sheet 
              color="secondary" 
              class="rounded-xl position-absolute" 
              height="300" width="300" 
              style="opacity: 0.1; top: -20px; right: 20px; transform: rotate(12deg);"
           ></v-sheet>
           
           <v-card width="400" elevation="10" class="position-relative bg-white border-0 rounded-xl overflow-hidden">
              <v-img 
                 src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1000&auto=format&fit=crop"
                 height="200" cover class="align-end"
                 gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              >
                 <v-card-title class="text-white">Dashboard Agência 01</v-card-title>
              </v-img>
              <v-list lines="one">
                 <v-list-item prepend-icon="mdi-car" title="Sedan Executivo" subtitle="Disponível">
                    <template v-slot:append><v-badge color="success" dot inline></v-badge></template>
                 </v-list-item>
                 <v-divider inset></v-divider>
                 <v-list-item prepend-icon="mdi-truck" title="Utilitário Leve" subtitle="Em Manutenção">
                    <template v-slot:append><v-badge color="warning" dot inline></v-badge></template>
                 </v-list-item>
              </v-list>
           </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-sheet color="white" class="py-16">
      <v-container>
        <v-row class="mb-10">
          <v-col cols="12" class="text-center">
            <p class="text-overline text-secondary font-weight-bold mb-2">RECURSOS</p>
            <h2 class="text-h4 font-weight-bold text-primary">Tudo o que sua operação precisa</h2>
          </v-col>
        </v-row>

        <v-row>
          <v-col v-for="(feature, i) in features" :key="i" cols="12" md="4">
            <v-hover v-slot="{ isHovering, props }">
              <v-card 
                v-bind="props"
                class="h-100 pt-4 pb-2 transition-swing"
                :elevation="isHovering ? 8 : 0"
                :style="isHovering ? 'border-color: transparent' : ''"
              >
                <v-card-item>
                  <div class="d-flex justify-space-between align-start mb-4">
                    <v-sheet :color="feature.color" height="50" width="50" class="rounded-lg d-flex align-center justify-center bg-opacity-10">
                      <v-icon :icon="feature.icon" :color="feature.color" size="28"></v-icon>
                    </v-sheet>
                    <v-chip v-if="feature.tag" size="small" color="grey" variant="flat">{{ feature.tag }}</v-chip>
                    <v-chip v-else size="small" color="green-lighten-4" class="text-green-darken-3 font-weight-bold" variant="flat">Ativo</v-chip>
                  </div>
                  <v-card-title class="text-h6 font-weight-bold text-primary px-0">{{ feature.title }}</v-card-title>
                </v-card-item>

                <v-card-text class="text-body-1 text-grey-darken-1">{{ feature.description }}</v-card-text>

                <v-card-actions class="px-4">
                  <v-btn 
                    v-if="feature.active" 
                    variant="text" color="secondary" :to="feature.route" class="px-0"
                  >
                    Acessar Painel <v-icon end icon="mdi-arrow-right" size="small"></v-icon>
                  </v-btn>
                  <v-btn v-else disabled variant="text" class="px-0">Em Desenvolvimento</v-btn>
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <v-container class="py-16">
      <v-card color="primary" theme="dark" class="rounded-xl overflow-hidden px-md-10 py-10">
        <v-row align="center">
          <v-col cols="12" md="8" class="text-center text-md-left">
            <h3 class="text-h4 font-weight-bold mb-2">Pronto para otimizar sua frota?</h3>
            <p class="text-grey-lighten-3 text-body-1">Gerencie agências e veículos em uma única plataforma centralizada.</p>
          </v-col>
          <v-col cols="12" md="4" class="text-center text-md-right">
            <v-btn color="white" class="text-primary font-weight-bold" size="large" to="/agencias">
              Iniciar Agora
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-container>

  </v-container>
</template>

<script setup lang="ts">
const features = [
  {
    title: 'Gestão de Agências',
    description: 'Controle centralizado de filiais. Gerencie endereços, capacidade de pátio e alocação de recursos por unidade geográfica.',
    icon: 'mdi-office-building-marker',
    color: 'blue-darken-2',
    route: '/agencias',
    active: true
  },
  {
    title: 'Controle de Frota',
    description: 'Rastreamento completo do ciclo de vida do veículo. Da aquisição à manutenção e desativação.',
    icon: 'mdi-car-connected',
    color: 'teal-darken-1',
    route: '/frota',
    active: false,
    tag: 'Em Breve'
  },
  {
    title: 'Analytics & Dashboards',
    description: 'Inteligência de dados para tomada de decisão. Métricas de faturamento, ociosidade e ROI por veículo.',
    icon: 'mdi-chart-box-outline',
    color: 'indigo-accent-2',
    route: '/dashboards',
    active: false,
    tag: 'Em Breve'
  }
];
</script>

<style scoped>
.transition-swing {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>