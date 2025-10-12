<template>
  <div class="flex min-h-screen bg-gradient-to-br from-blue-700 via-green-700 to-white text-black">
    <!-- Sidebar -->
    <aside class="w-64 bg-black/40 backdrop-blur-lg text-white p-5 hidden md:flex flex-col">
      <h1 class="text-2xl font-bold mb-8 text-center">Serveur IA</h1>
      <nav class="space-y-4">
        <RouterLink to="/" class="block hover:text-green-300 transition">Dashboard</RouterLink>
        <RouterLink to="/temp" class="block hover:text-green-300 transition"
          >Température</RouterLink
        >
        <RouterLink to="/humidity" class="block hover:text-green-300 transition"
          >Humidité</RouterLink
        >
        <RouterLink to="/power" class="block hover:text-green-300 transition"
          >Électricité</RouterLink
        >
        <RouterLink to="/forecast" class="block hover:text-green-300 transition"
          >Prévisions</RouterLink
        >
        <RouterLink to="/alerts" class="block hover:text-green-300 transition">Alertes</RouterLink>
        <RouterLink to="/config" class="block hover:text-green-300 transition"
          >Configuration</RouterLink
        >
        <RouterLink to="/profile" class="block hover:text-green-300 transition">Profil</RouterLink>
      </nav>
    </aside>

    <!-- Contenu principal -->
    <main class="flex-1 p-6 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts"></script>
