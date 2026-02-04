import { createRouter, createWebHistory } from 'vue-router'
import AgenciesList from '@/views/AgenciesList.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/home',
      redirect: '/'
    },
    {
      path: '/agencias',
      name: 'agencies',
      component: AgenciesList
    }
  ]
})

export default router