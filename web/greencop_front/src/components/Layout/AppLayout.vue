<template>
  <div class="flex h-screen bg-neutral">
    <AppSidebar />
    <div class="flex-1 flex flex-col">
      <AppHeader />
      <main class="p-6 overflow-y-auto flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
</script>
