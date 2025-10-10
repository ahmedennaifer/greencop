<template>
  <div
    class="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg text-center border border-white/30 hover:scale-105 transform transition duration-300"
  >
    <h3 class="text-lg font-semibold text-white mb-2">{{ title }}</h3>
    <p :class="['text-2xl font-bold', valueColor]">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string
  valueColor?: string
}>()
</script>
