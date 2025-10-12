<template>
  <AppLayout>
    <div>
      <h2 class="title mb-4">Vue d'ensemble</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Chaleur" value="32 °C" valueColor="text-red-600" />
        <MetricCard title="Humidité" value="45 %" valueColor="text-blue-600" />
        <MetricCard title="Électricité" value="520 kWh" valueColor="text-green-600" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import MetricCard from '@/components/metrics/MetricCard.vue'
</script>
