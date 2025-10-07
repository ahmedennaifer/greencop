import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import des pages
import DashboardPage from '@/pages/DashboardPage.vue'
import TemperaturePage from '@/pages/TemperaturePage.vue'
import HumidityPage from '@/pages/HumidityPage.vue'
import ElectricityPage from '@/pages/ElectricityPage.vue'
import ConfigPlanPage from '@/pages/ConfigPlanPage.vue'
import AlertsPage from '@/pages/AlertsPage.vue'
import ForecastPage from '@/pages/ForecastPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import Signup from '@/pages/SignUp.vue'
import Login from '@/pages/Login.vue'

//  routes
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Dashboard', component: DashboardPage },
  { path: '/temp', name: 'Temperature', component: TemperaturePage },
  { path: '/humidity', name: 'Humidity', component: HumidityPage },
  { path: '/power', name: 'Electricity', component: ElectricityPage },
  { path: '/config', name: 'ConfigPlan', component: ConfigPlanPage },
  { path: '/alerts', name: 'Alerts', component: AlertsPage },
  { path: '/forecast', name: 'Forecast', component: ForecastPage },
  { path: '/profile', name: 'Profile', component: ProfilePage },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/login', name: 'Profile', component: Login },
]

//Création du routeur
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Export
export default router
