<template>
  <button
    @click="$emit('click')"
    class="px-5 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 hover:scale-105 transition-transform duration-200"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>
