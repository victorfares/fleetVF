<template>
  <v-app theme="dark">
    <v-navigation-drawer 
      v-model="drawer" 
      :rail="rail" 
      permanent 
      @click="rail = false"
    >
      <v-list>
        <v-list-item
          prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
          title="FleetVF"
          subtitle="Gestão de Frotas"
          nav
        >
          <template v-slot:append>
            <v-btn
              :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
              variant="text"
              @click.stop="rail = !rail"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item 
          prepend-icon="mdi-home" 
          title="Home" 
          value="home"
          to="/"
        ></v-list-item>

        <v-list-item 
          prepend-icon="mdi-domain" 
          title="Agências" 
          value="agencias"
          to="/agencias"
        ></v-list-item>

        <v-list-item 
          prepend-icon="mdi-car" 
          title="Veículos (Em breve)" 
          value="carros"
          disabled
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar title="Painel Administrativo" elevation="1"></v-app-bar>

    <v-main>
      <v-container fluid class="pa-0 fill-height align-start">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(true)
const rail = ref(false)
</script>