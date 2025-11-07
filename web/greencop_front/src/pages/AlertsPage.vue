<template>
  <AppLayout>
    <div
      class="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-900 via-green-900 to-white text-white p-6"
    >
      <div class="w-full max-w-4xl">
        <h2 class="text-3xl font-bold mb-6 text-center">Alertes</h2>

        <div class="grid gap-4">
          <!-- Alerte blanche (info) -->
          <div
            v-for="alert in infoAlerts"
            :key="alert.id"
            class="p-4 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md shadow-lg"
          >
            <h3 class="font-semibold text-lg">ℹ️ {{ alert.title }}</h3>
            <p class="text-white/80">{{ alert.message }}</p>
          </div>

          <!-- Alerte jaune (importante) -->
          <div
            v-for="alert in warningAlerts"
            :key="alert.id"
            class="p-4 rounded-xl bg-yellow-400/20 border border-yellow-400/40 backdrop-blur-md shadow-lg"
          >
            <h3 class="font-semibold text-lg text-yellow-300">⚠️ {{ alert.title }}</h3>
            <p class="text-yellow-100">{{ alert.message }}</p>
          </div>

          <!-- Alerte rouge (critique) -->
          <div
            v-for="alert in criticalAlerts"
            :key="alert.id"
            class="p-4 rounded-xl bg-red-600/20 border border-red-500/40 backdrop-blur-md shadow-lg"
          >
            <h3 class="font-semibold text-lg text-red-400">🚨 {{ alert.title }}</h3>
            <p class="text-red-100">{{ alert.message }}</p>
          </div>
        </div>

        <!-- Si aucune alerte -->
        <div
          v-if="!infoAlerts.length && !warningAlerts.length && !criticalAlerts.length"
          class="text-center mt-10 text-white/70"
        >
          <p>Aucune alerte active actuellement.</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/Layout/AppLayout.vue'
import { ref, onMounted } from 'vue'

// Simulation d'alertes (à connecter plus tard à ton backend)
const infoAlerts = ref([
  {
    id: 1,
    title: 'Capteur d’humidité recalibré',
    message: 'La calibration du capteur H-12 a été effectuée avec succès.',
  },
])

const warningAlerts = ref([
  { id: 2, title: 'Humidité élevée', message: 'La salle Serveur 2 atteint 78% d’humidité.' },
])

const criticalAlerts = ref([
  {
    id: 3,
    title: 'Surchauffe détectée',
    message: 'Température à 42°C dans la salle Serveur 1. Risque critique !',
  },
])

onMounted(() => {
  console.log('Alertes chargées')
})
</script>
