<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import GlobalSnackbar from '@/components/GlobalSnackbar.vue';

const authStore = useAuthStore();
const router = useRouter();

const drawer = ref(true);
const rail = ref(false);

const userInitials = computed(() => {
  const name = authStore.user?.name || 'VF';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});

const menuItems = computed(() => {
  const menus = [
    { title: 'Início', icon: 'mdi-home', to: '/' },
    { title: 'Nossa Frota', icon: 'mdi-car-search', to: '/frota' },
    { title: 'Nossas Agências', icon: 'mdi-map-marker-radius', to: '/agencias' },
  ];

  if (authStore.isAuthenticated) {
    if (authStore.isAdmin || authStore.isManager) {
      menus.push(
        { type: 'divider' },
        { title: 'Gestão de Veículos', icon: 'mdi-car-cog', to: '/admin/cars' },
        { title: 'Gestão de Agências', icon: 'mdi-office-building-cog', to: '/admin/agencies' }
      );
    } else {
      menus.push(
        { type: 'divider' },
        { title: 'Meus Aluguéis', icon: 'mdi-history', to: '/meus-alugueis' }
      );
    }
  } else {
    menus.push(
      { type: 'divider' },
      { title: 'Entrar', icon: 'mdi-login', to: '/login' },
      { title: 'Criar Conta', icon: 'mdi-account-plus', to: '/signup' }
    );
  }

  return menus;
});

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <v-app>
    <v-navigation-drawer 
      v-model="drawer" 
      :rail="rail" 
      permanent 
      @click="rail = false"
      color="primary" 
      theme="dark"
      elevation="2"
      width="280"
    >
      <v-list>
        <v-list-item nav>
          <template v-slot:prepend>
             <v-icon icon="mdi-steering" size="32" color="white" class="mr-2"></v-icon>
          </template>
          
          <v-list-item-title class="font-weight-black text-h6 text-uppercase text-white" style="letter-spacing: 1px;">
            FleetVF
          </v-list-item-title>
          
          <template v-slot:append>
            <v-btn 
              :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'" 
              variant="text" 
              size="small" 
              color="white"
              @click.stop="rail = !rail"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-divider class="mb-2 border-opacity-25"></v-divider>

      <v-list density="compact" nav>
        <template v-for="(item, i) in menuItems" :key="i">
          <v-divider 
            v-if="item.type === 'divider'" 
            class="my-2 border-opacity-25"
          ></v-divider>
          
          <v-list-item 
            v-else
            :prepend-icon="item.icon" 
            :title="item.title" 
            :to="item.to"
            active-color="secondary"
            rounded="lg"
            class="mb-1 font-weight-medium"
          ></v-list-item>
        </template>
      </v-list>

      <template v-slot:append v-if="authStore.isAuthenticated">
        <div class="pa-2">
          <v-fade-transition mode="out-in">
            <v-btn 
              v-if="!rail" 
              block 
              color="error" 
              variant="flat" 
              prepend-icon="mdi-logout" 
              class="font-weight-bold"
              @click="handleLogout"
            >
              Sair
            </v-btn>
            <v-btn 
              v-else 
              icon="mdi-logout" 
              color="error" 
              variant="flat" 
              @click="handleLogout"
            ></v-btn>
          </v-fade-transition>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar elevation="0" color="white" class="border-b">
      <v-app-bar-nav-icon v-if="!drawer" @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-app-bar-title class="text-grey-darken-3 font-weight-bold text-body-1">
        {{ authStore.isAuthenticated ? (authStore.isAdmin ? 'Painel Administrativo' : 'Área do Cliente') : 'Bem-vindo' }}
      </v-app-bar-title>
      
      <template v-slot:append>
        <v-menu v-if="authStore.isAuthenticated" location="bottom end" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-avatar 
              color="secondary" 
              size="36" 
              class="ml-4 mr-2 cursor-pointer elevation-1" 
              v-bind="props"
            >
              <span class="text-white font-weight-bold text-caption">{{ userInitials }}</span>
            </v-avatar>
          </template>
          
          <v-card min-width="200" rounded="lg" elevation="4">
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="secondary" size="40">
                    <span class="text-white text-h6">{{ userInitials }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">{{ authStore.user?.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ authStore.user?.email }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-list density="compact" nav>
              <v-list-item prepend-icon="mdi-logout" title="Sair" color="error" @click="handleLogout" />
            </v-list>
          </v-card>
        </v-menu>

        <div v-else class="d-flex align-center ga-2 mr-2">
          <v-btn variant="text" to="/login" class="font-weight-bold text-grey-darken-3">Entrar</v-btn>
          <v-btn color="primary" variant="flat" to="/signup" class="font-weight-bold">Criar Conta</v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <router-view></router-view>
    </v-main>

    <v-footer class="bg-white text-center d-flex flex-column py-4 border-t" app absolute>
      <div class="text-caption text-grey">
        &copy; {{ new Date().getFullYear() }} FleetVF. Desenvolvido por Victor Fares.
      </div>
    </v-footer>

    <GlobalSnackbar />
  </v-app>
</template>