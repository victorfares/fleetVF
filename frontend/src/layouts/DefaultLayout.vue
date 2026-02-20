<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

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
        { title: 'Gestão de Agências', icon: 'mdi-office-building-cog', to: '/admin/agencies' },
        { title: 'Gestão de Reservas', icon: 'mdi-calendar-clock', to: '/admin/reservas' },
        { title: 'Gestão de Usuários', icon: 'mdi-account-group', to: '/admin/usuarios' },
      );


      if (authStore.isAdmin) {
        menus.push(
          { title: 'Logs de Auditoria', icon: 'mdi-shield-search', to: '/admin/auditoria' }
        );
      }

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
      color="amber-darken-2" 
      theme="dark"
      elevation="2" 
      width="280"
    >
      <v-list>
        <v-list-item nav>
          <template v-slot:prepend>
            <v-icon icon="mdi-steering" size="32" color="black" class="mr-2"></v-icon>
          </template>

          <v-list-item-title class="font-weight-black text-h6 text-uppercase text-black" style="letter-spacing: 1px;">
            FleetVF
          </v-list-item-title>

          <template v-slot:append>
            <v-btn :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'" variant="text" size="small" color="black"
              @click.stop="rail = !rail"></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-divider class="mb-2 border-opacity-25" color="black"></v-divider>

      <v-list density="compact" nav>
        <template v-for="(item, i) in menuItems" :key="i">
          <v-divider v-if="item.type === 'divider'" class="my-2 border-opacity-25" color="black"></v-divider>

          <v-list-item 
            v-else 
            :prepend-icon="item.icon" 
            :title="item.title" 
            :to="item.to" 
            active-color="black"
            rounded="lg" 
            class="mb-1 font-weight-bold"
          ></v-list-item>
        </template>
      </v-list>

      <template v-slot:append v-if="authStore.isAuthenticated">
        <div class="pa-2">
          <v-fade-transition mode="out-in">
            <v-btn v-if="!rail" block color="black" variant="flat" prepend-icon="mdi-logout" class="font-weight-bold text-amber-accent-2"
              @click="handleLogout">
              Sair
            </v-btn>
            <v-btn v-else icon="mdi-logout" color="black" variant="flat" class="text-amber-accent-2" @click="handleLogout"></v-btn>
          </v-fade-transition>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar elevation="0" color="white" class="border-b">
      <v-app-bar-nav-icon v-if="!drawer" @click="drawer = !drawer" color="black"></v-app-bar-nav-icon>

      <v-app-bar-title class="text-black font-weight-black text-body-1">
        {{ authStore.isAuthenticated ? (authStore.isAdmin ? 'Painel Administrativo' : 'Área do Cliente') : 'Bem-vindo' }}
      </v-app-bar-title>

      <template v-slot:append>
        <v-menu v-if="authStore.isAuthenticated" location="bottom end" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-avatar color="amber-darken-2" size="36" class="ml-4 mr-2 cursor-pointer elevation-2 font-weight-black text-black" v-bind="props">
              {{ userInitials }}
            </v-avatar>
          </template>

          <v-card min-width="200" rounded="lg" elevation="4" class="border">
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="amber-darken-2" size="40" class="font-weight-black text-black elevation-2">
                    {{ userInitials }}
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-black">{{ authStore.user?.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption font-weight-bold">{{ authStore.user?.email }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-list density="compact" nav>
              <v-list-item prepend-icon="mdi-logout" title="Sair" class="font-weight-bold text-error" @click="handleLogout" />
            </v-list>
          </v-card>
        </v-menu>

        <div v-else class="d-flex align-center ga-2 mr-2">
          <v-btn variant="text" to="/login" class="font-weight-black text-black">Entrar</v-btn>
          <v-btn color="amber-darken-2" variant="flat" to="/signup" class="font-weight-black text-black px-4">Criar Conta</v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <slot></slot>
    </v-main>

    <v-footer class="bg-grey-lighten-5 text-center d-flex flex-column py-6 border-t" app absolute>
      <div class="text-caption text-grey-darken-2 font-weight-bold mb-2 d-flex align-center justify-center">
         <v-icon icon="mdi-alert-decagram" color="amber-darken-2" size="small" class="mr-2"></v-icon>
         Este site é um projeto fictício para fins de demonstração. Nenhuma reserva é real.
      </div>
      
      <div class="text-caption text-grey-darken-3 font-weight-medium">
        &copy; {{ new Date().getFullYear() }} FleetVF. Desenvolvido por 
        <a 
          href="https://github.com/victorfares" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="text-decoration-none font-weight-black text-amber-darken-3 header-link"
        >
          Victor Fares
        </a>.
      </div>
    </v-footer>
    
  </v-app>
</template>

<style scoped>
.header-link:hover {
  text-decoration: underline !important;
}
</style>