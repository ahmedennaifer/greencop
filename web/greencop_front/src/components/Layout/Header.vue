<template>
  <header class="flex justify-between items-center p-4 bg-white shadow-sm">
    <h1 class="text-xl font-semibold">{{ title }}</h1>
    <router-link to="/profile" class="btn btn-secondary">Profil</router-link>
  </header>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: 'ServerAI Dashboard' },
})
</script>
