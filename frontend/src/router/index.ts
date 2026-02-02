
// 1. Importações do Vue Router
import { createRouter, createWebHistory } from 'vue-router'

// 2. Importação dos Componentes (Layouts e Telas)
// O @ significa "src/"
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import Home from '@/views/Home.vue' // Se sua pasta chamar 'pages', mude para '@/pages/Home.vue'

// 3. Definição das Rotas
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // Quando o usuário acessar a raiz...
      component: DefaultLayout, // ...carregue o Layout com Menu Lateral...
      children: [
        {
          path: '',
          name: 'Home',
          component: Home,
        },

      ],
    },
  ],
})

export default router