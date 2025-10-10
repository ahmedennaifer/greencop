<template>
  <div
    class="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/30 hover:scale-105 transform transition duration-300"
  >
    <h4 class="text-xl font-semibold text-white mb-3">{{ name }}</h4>
    <div class="space-y-1 text-white/80">
      <p>
        🌡️ Température : <span class="text-red-400">{{ temperature }} °C</span>
      </p>
      <p>
        💧 Humidité : <span class="text-blue-400">{{ humidity }} %</span>
      </p>
      <p>
        ⚡ Électricité : <span class="text-green-400">{{ power }} kWh</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  temperature: number
  humidity: number
  power: number
}>()
</script>
