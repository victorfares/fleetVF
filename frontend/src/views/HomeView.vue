<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCars } from '@/composables/useCars';
import CarCard from '@/components/CarCard.vue';

const router = useRouter();
const authStore = useAuthStore();

const { 
  cars, 
  loading, 
  fetchCars, 
  itemsPerPage 
} = useCars();

// Estado da busca rápida
const searchTerm = ref('');

// Ação de Buscar
function handleSearch() {
  if (searchTerm.value && searchTerm.value.trim() !== '') {
    router.push({ path: '/frota', query: { search: searchTerm.value } });
  } else {
    router.push('/frota');
  }
}

function goToFleet() {
  router.push('/frota');
}

onMounted(() => {
  itemsPerPage.value = 3; 
  fetchCars();
});

const benefits = [
  { title: 'Transparência Total', desc: 'Sem taxas ocultas. Valor final garantido.', icon: 'mdi-check-decagram' },
  { title: 'Suporte 24/7', desc: 'Equipe pronta para ajudar a qualquer hora.', icon: 'mdi-headset' },
  { title: 'Frota Premium', desc: 'Carros revisados e higienizados.', icon: 'mdi-car-star' }
];
</script>

<template>
  <v-container fluid class="pa-0">
    
    <v-sheet color="white" class="position-relative overflow-hidden pb-16 pt-10">
      <div class="position-absolute top-0 right-0 h-100 w-50 bg-blue-lighten-5 rounded-s-xl d-none d-md-block" style="opacity: 0.5;"></div>

      <v-container class="position-relative">
        <v-row align="center" justify="center">
          
          <v-col cols="12" md="6" lg="5" class="text-center text-md-left z-index-1">
            <v-chip color="black" variant="flat" size="small" class="mb-6 font-weight-bold text-uppercase text-amber-accent-3">
              Ofertas de Verão - Até 30% OFF
            </v-chip>
            
            <h1 class="text-h3 text-lg-h2 font-weight-black text-black mb-4" style="line-height: 1.1;">
              Explore o mundo <br>
              <span class="text-amber-darken-2">no seu ritmo</span>
            </h1>
            
            <p class="text-h6 text-grey-darken-2 mb-8 font-weight-bold lh-sm">
              Do compacto econômico ao SUV de luxo. Liberdade e segurança para sua família.
            </p>
            
            <div class="d-flex flex-column flex-sm-row gap-4 justify-center justify-md-start align-center ga-4">
              <v-btn 
                to="/frota" 
                color="amber-darken-1" 
                size="x-large" 
                elevation="4" 
                rounded="xl" 
                class="px-8 font-weight-black text-black"
              >
                VER CARROS
                <v-icon end icon="mdi-car-side" class="ml-2"></v-icon>
              </v-btn>
              
              <div class="d-flex align-center text-black">
                <v-icon icon="mdi-phone-in-talk" color="amber-darken-2" class="mr-2"></v-icon>
                <span class="font-weight-black">0800 123 4567</span>
              </div>
            </div>
            
            <div class="mt-10 d-flex align-center justify-center justify-md-start text-black ga-6">
              <div class="d-flex align-center"><v-icon icon="mdi-shield-check" color="success" class="mr-2"></v-icon><span class="text-body-2 font-weight-bold">Seguro Incluso</span></div>
              <div class="d-flex align-center"><v-icon icon="mdi-map-marker-check" color="success" class="mr-2"></v-icon><span class="text-body-2 font-weight-bold">KM Livre</span></div>
            </div>
          </v-col>

          <v-col cols="12" md="6" lg="6" offset-lg="1" class="position-relative mt-10 mt-md-0">
              <v-sheet color="amber-darken-1" class="rounded-circle position-absolute d-none d-md-block" height="200" width="200" style="opacity: 0.15; bottom: -40px; left: -40px;"></v-sheet>

              <v-card elevation="12" rounded="xl" class="border border-md border-amber-darken-1 overflow-hidden bg-white">
                <v-img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop" height="200" cover gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,0.8)" class="align-end">
                  <v-card-title class="text-white text-h5 font-weight-black px-6 pb-4" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
                    Encontre seu carro ideal
                  </v-card-title>
                </v-img>

                <v-card-text class="pt-8 px-6">
                  <v-text-field
                    v-model="searchTerm"
                    label="Buscar por marca ou modelo (ex: Nissan)"
                    prepend-inner-icon="mdi-car-search"
                    variant="outlined" 
                    bg-color="white"
                    color="black"
                    base-color="black"
                    density="comfortable"
                    hide-details="auto"
                    class="mb-2 font-weight-bold"
                    @keyup.enter="handleSearch"
                  ></v-text-field>
                </v-card-text>

                <v-card-actions class="px-6 pb-6 pt-0">
                  <v-btn block color="black" variant="flat" size="x-large" class="font-weight-black rounded-lg text-amber-accent-3" @click="handleSearch">
                    BUSCAR VEÍCULOS
                  </v-btn>
                </v-card-actions>
              </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <v-container class="py-16">
      <v-row class="mb-8">
        <v-col cols="12" class="text-center">
          <p class="text-overline text-grey-darken-2 font-weight-black mb-2">NOSSA FROTA</p>
          <h2 class="text-h4 font-weight-black text-black">Destaques Recentes</h2>
        </v-col>
      </v-row>

      <v-row v-if="loading">
        <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="4">
          <v-skeleton-loader type="image, article" class="rounded-lg border"></v-skeleton-loader>
        </v-col>
      </v-row>

      <v-row v-else-if="!cars.length" justify="center">
        <v-col cols="12" class="text-center">
          <p class="text-grey font-weight-bold">Nenhum veículo disponível no momento.</p>
          <v-btn variant="text" color="black" class="font-weight-black mt-2" to="/frota">Ver todos</v-btn>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="car in cars" :key="car.id" cols="12" sm="6" md="4">
          <CarCard 
            :car="car" 
            @reserve="goToFleet"
            @edit="goToFleet"
          />
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col class="text-center">
          <v-btn to="/frota" variant="outlined" color="black" rounded="xl" size="large" class="px-8 font-weight-black">
            VER FROTA COMPLETA
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-sheet class="py-16 text-center bg-grey-lighten-4">
      <v-container>
        <v-row justify="center" class="mb-10">
          <v-col cols="12" md="8">
            <h3 class="text-h4 font-weight-black mb-4 text-black">Por que alugar com a FleetVF?</h3>
            <p class="text-h6 font-weight-bold text-grey-darken-2">Simplificamos o processo para você.</p>
          </v-col>
        </v-row>
        
        <v-row justify="center" class="text-center">
          <v-col v-for="(benefit, i) in benefits" :key="i" cols="12" sm="6" md="4">
            <v-card 
                class="py-10 px-6 h-100 rounded-xl d-flex flex-column align-center justify-center transition-swing border" 
                elevation="2"
                color="amber-darken-1"
            >
              <v-avatar color="black" size="80" class="mb-6 elevation-4">
                <v-icon :icon="benefit.icon" color="amber-darken-1" size="40"></v-icon>
              </v-avatar>
              
              <h4 class="text-h5 font-weight-black mb-3 text-black">{{ benefit.title }}</h4>
              <p class="text-body-1 font-weight-bold text-black" style="opacity: 0.85;">{{ benefit.desc }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <v-container class="py-16">
      <v-card theme="dark" class="bg-black rounded-xl overflow-hidden elevation-10">
        <v-img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop" height="350" cover gradient="to right, rgba(0,0,0,0.9), rgba(0,0,0,0.3)">
          <v-row class="h-100 pa-8 pa-md-16" align="center">
            <v-col cols="12" md="6">
              <h3 class="text-h4 font-weight-black mb-4 text-white">{{ authStore.isAuthenticated ? 'Pronto para a próxima viagem?' : 'Comece sua jornada agora' }}</h3>
              <p class="text-body-1 text-grey-lighten-2 mb-8 font-weight-medium">
                {{ authStore.isAuthenticated ? 'Confira nossa frota atualizada e garanta o melhor preço.' : 'Cadastre-se gratuitamente e tenha acesso a descontos exclusivos.' }}
              </p>
              <div class="d-flex ga-4 flex-wrap">
                <v-btn v-if="!authStore.isAuthenticated" prepend-icon="mdi-account-plus" color="amber-darken-1" variant="flat" size="large" class="px-6 text-black font-weight-black" to="/signup">Criar Conta</v-btn>
                <v-btn v-else prepend-icon="mdi-car-search" color="amber-darken-1" variant="flat" size="large" class="px-6 text-black font-weight-black" to="/frota">Reservar Agora</v-btn>
              </div>
            </v-col>
          </v-row>
        </v-img>
      </v-card>
    </v-container>

  </v-container>
</template>

<style scoped>
.z-index-1 {
  z-index: 1;
}
.lh-sm {
  line-height: 1.4;
}
.transition-swing:hover {
  transform: translateY(-5px);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
}
</style>