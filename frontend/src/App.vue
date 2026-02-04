<template>
  <v-app style="font-family: 'Inter', sans-serif;">
    
    <v-navigation-drawer 
      v-model="drawer" 
      :rail="rail" 
      permanent 
      @click="rail = false"
      color="primary" 
      theme="dark"
    >
      <v-list>
        <v-list-item nav>
          <template v-slot:prepend>
             <v-icon icon="mdi-steering" size="32" color="secondary"></v-icon>
          </template>
          <v-list-item-title class="font-weight-bold text-h6">
            FleetVF
          </v-list-item-title>
          
          <template v-slot:append>
            <v-btn
              :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
              variant="text"
              size="small"
              @click.stop="rail = !rail"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-divider class="mb-2"></v-divider>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-domain" title="Agências" to="/agencias"></v-list-item>
        <v-list-item prepend-icon="mdi-car" title="Frota (Em Breve)" disabled></v-list-item>
        <v-list-item prepend-icon="mdi-chart-box-outline" title="Dashboards" disabled></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar elevation="0" color="background" class="border-b">
      <v-app-bar-title class="text-primary font-weight-bold">
        Painel Administrativo
      </v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-bell-outline" color="grey-darken-1"></v-btn>
        <v-avatar color="secondary" size="32" class="ml-4 mr-2">
            <span class="text-white font-weight-bold">VF</span>
        </v-avatar>
      </template>
    </v-app-bar>

    <v-main class="bg-background">
      <router-view></router-view>
    </v-main>

    <v-footer class="bg-white text-center d-flex flex-column py-6 border-t mt-auto">
      <div class="text-caption text-grey">
        &copy; {{ new Date().getFullYear() }} FleetVF. Desenvolvido por Victor Fares.
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(true)
const rail = ref(false)
</script>

<style>
/* CSS Reset para garantir background em toda a altura */
html, body {
  background-color: #F8FAFC; 
}
</style>