<template>
  <AppLayout>
    <div
      class="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-900 via-green-900 to-white text-white p-6"
    >
      <div class="w-full max-w-6xl">
        <h2 class="text-3xl font-bold text-center mb-8">Prévisions des Salles Serveurs</h2>

        <!-- Grille des salles -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="room in serverRooms"
            :key="room.id"
            class="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl"
          >
            <h3 class="text-xl font-semibold mb-4 text-center text-white/90">🖥️ {{ room.name }}</h3>

            <!-- Métriques actuelles -->
            <div class="space-y-3 mb-4">
              <div class="flex justify-between">
                <span>🌡️ Température :</span>
                <span class="font-semibold text-red-300">{{ room.metrics.temperature }} °C</span>
              </div>
              <div class="flex justify-between">
                <span>💧 Humidité :</span>
                <span class="font-semibold text-blue-300">{{ room.metrics.humidity }} %</span>
              </div>
              <div class="flex justify-between">
                <span>⚡ Électricité :</span>
                <span class="font-semibold text-green-300">{{ room.metrics.electricity }} kWh</span>
              </div>
            </div>

            <hr class="border-white/30 my-3" />

            <!-- Prévisions -->
            <div>
              <h4 class="text-lg font-semibold mb-2 text-white/80">Prévisions</h4>
              <ul class="space-y-2">
                <li class="flex justify-between">
                  <span>Température prévue :</span>
                  <span class="text-red-400 font-medium">{{ room.forecast.temperature }} °C</span>
                </li>
                <li class="flex justify-between">
                  <span>Humidité prévue :</span>
                  <span class="text-blue-400 font-medium">{{ room.forecast.humidity }} %</span>
                </li>
                <li class="flex justify-between">
                  <span>Consommation prévue :</span>
                  <span class="text-green-400 font-medium"
                    >{{ room.forecast.electricity }} kWh</span
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/Layout/AppLayout.vue'
import { ref } from 'vue'

// Simulation de 3 salles serveurs avec métriques actuelles et prévisions
const serverRooms = ref([
  {
    id: 1,
    name: 'Salle Serveur 1',
    metrics: { temperature: 32, humidity: 45, electricity: 520 },
    forecast: { temperature: 34, humidity: 48, electricity: 540 },
  },
  {
    id: 2,
    name: 'Salle Serveur 2',
    metrics: { temperature: 29, humidity: 50, electricity: 480 },
    forecast: { temperature: 31, humidity: 52, electricity: 500 },
  },
  {
    id: 3,
    name: 'Salle Serveur 3',
    metrics: { temperature: 35, humidity: 42, electricity: 610 },
    forecast: { temperature: 37, humidity: 44, electricity: 640 },
  },
])
</script>
