<script setup lang="ts">
import { ref } from 'vue';

const drawer = ref(true); // Controla se o menu lateral está aberto
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item title="FleetVF" subtitle="Gestão de Frotas"></v-list-item>
        <v-divider></v-divider>
        
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" value="home" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-car" title="Frota" value="cars" to="/frota"></v-list-item>
        <v-list-item prepend-icon="mdi-domain" title="Agências" value="agencies" to="/agencias"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Painel Administrativo</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view /> </v-container>
    </v-main>
  </v-app>
</template>