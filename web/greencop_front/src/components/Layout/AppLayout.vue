<template>
  <div class="flex h-screen">
    <AppSidebar />
    <div class="flex-1 flex flex-col">
      <AppHeader />
      <main class="p-6 overflow-y-auto flex-1">
        <!-- <slot /> -->
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './Sidebar.vue'
import AppHeader from './Header.vue'
</script>
