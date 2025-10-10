<template>
  <div
    class="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/30 hover:scale-105 transform transition duration-300"
  >
    <h4 class="text-lg font-semibold text-white mb-2">📡 {{ room }}</h4>
    <p class="text-white/80">
      Capteurs : <span class="font-bold text-green-400">{{ count }}</span>
    </p>
    <p class="text-sm mt-2" :class="status === 'Actifs' ? 'text-green-300' : 'text-red-300'">
      {{ status }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  room: string
  count: number
  status: string
}>()
</script>
