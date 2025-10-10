<template>
  <AppLayout>
    <div
      class="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-green-900 to-white text-black p-6 space-y-10"
    >
      <!-- Titre -->
      <h2 class="text-3xl font-bold mb-4 text-white drop-shadow-lg">Dashboard</h2>

      <!-- Metrices globales -->
      <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Température moyenne" value="32 °C" valueColor="text-red-400" />
        <MetricCard title="Humidité moyenne" value="45 %" valueColor="text-blue-400" />
        <MetricCard title="Consommation électrique" value="520 kWh" valueColor="text-green-400" />
      </div> -->

      <!-- Server rooms -->
      <section>
        <h3 class="text-2xl font-semibold text-white mb-4">Salles serveurs</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServerRoomCard
            v-for="room in serverRooms"
            :key="room.id"
            :name="room.name"
            :temperature="room.temperature"
            :humidity="room.humidity"
            :power="room.power"
          />
        </div>
      </section>

      <!-- Capteurs -->
      <section>
        <h3 class="text-2xl font-semibold text-white mb-4">Capteurs installés</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SensorCard
            v-for="sensor in sensors"
            :key="sensor.id"
            :room="sensor.room"
            :count="sensor.count"
            :status="sensor.status"
          />
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/Layout/AppLayout.vue'
import MetricCard from '@/components/metrics/MetricCard.vue'
import ServerRoomCard from '@/components/servers/ServerRoomCard.vue'
import SensorCard from '@/components/sensors/SensorCard.vue'

const serverRooms = [
  { id: 1, name: 'Salle A', temperature: 31, humidity: 42, power: 180 },
  { id: 2, name: 'Salle B', temperature: 33, humidity: 47, power: 210 },
  { id: 3, name: 'Salle C', temperature: 30, humidity: 44, power: 160 },
]

const sensors = [
  { id: 1, room: 'Salle A', count: 12, status: 'Actifs' },
  { id: 2, room: 'Salle B', count: 10, status: 'Actifs' },
  { id: 3, room: 'Salle C', count: 14, status: 'Actifs' },
]
</script>
