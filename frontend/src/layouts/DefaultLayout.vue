<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

// Lógica de Estado
const authStore = useAuthStore();
const router = useRouter();

const drawer = ref(true);
const rail = ref(false);

// Iniciais do Usuário para o Avatar (Ex: Victor Fares -> VF)
const userInitials = computed(() => {
  const name = authStore.user?.name || 'VF';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});

// Logout
function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

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
        
        <template v-if="authStore.isAdmin || authStore.isManager">
          <v-list-item prepend-icon="mdi-domain" title="Agências" to="/admin/agencies"></v-list-item>
          <v-list-item prepend-icon="mdi-car" title="Veículos" to="/admin/cars"></v-list-item>
        </template>

        <v-list-item v-if="!authStore.isAdmin" prepend-icon="mdi-car-key" title="Meus Aluguéis" to="/rentals"></v-list-item>

        <v-list-item prepend-icon="mdi-chart-box-outline" title="Dashboards" disabled></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="error" variant="tonal" v-if="!rail" @click="handleLogout">
            Sair
          </v-btn>
          <v-btn icon="mdi-logout" color="error" variant="text" v-else @click="handleLogout"></v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar elevation="0" color="background" class="border-b">
      <v-app-bar-nav-icon v-if="!drawer" @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-app-bar-title class="text-primary font-weight-bold">
        Painel Administrativo
      </v-app-bar-title>
      
      <template v-slot:append>
        <v-btn icon="mdi-bell-outline" color="grey-darken-1"></v-btn>
        
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-avatar color="secondary" size="32" class="ml-4 mr-2 cursor-pointer" v-bind="props">
              <span class="text-white font-weight-bold text-caption">{{ userInitials }}</span>
            </v-avatar>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title class="font-weight-bold">{{ authStore.user?.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item prepend-icon="mdi-account" title="Meu Perfil" to="/profile" />
            <v-list-item prepend-icon="mdi-logout" title="Sair" color="error" @click="handleLogout" />
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-6 fill-height align-start">
        <slot></slot> </v-container>
    </v-main>

    <v-footer class="bg-white text-center d-flex flex-column py-6 border-t mt-auto">
      <div class="text-caption text-grey">
        &copy; {{ new Date().getFullYear() }} FleetVF. Desenvolvido por Victor Fares.
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>