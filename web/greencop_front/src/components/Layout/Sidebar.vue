<template>
  <aside class="w-64 bg-white shadow-sm p-4 flex flex-col gap-3">
    <router-link to="/" class="font-semibold hover:text-primary">Dashboard</router-link>
    <router-link to="/temp" class="hover:text-primary">Température</router-link>
    <router-link to="/humidity" class="hover:text-primary">Humidité</router-link>
    <router-link to="/power" class="hover:text-primary">Consommation</router-link>
    <router-link to="/alerts" class="hover:text-primary">Alertes</router-link>
    <router-link to="/forecast" class="hover:text-primary">Prévisions</router-link>
    <router-link to="/config" class="hover:text-primary">Configuration</router-link>
  </aside>
</template>
