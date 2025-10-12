<template>
  <div class="card flex flex-col items-center text-center">
    <p class="text-gray-500">{{ title }}</p>
    <p :class="['text-3xl font-bold mt-2', valueColor]">{{ value }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  value: String,
  valueColor: { type: String, default: 'text-dark' },
})
</script>
