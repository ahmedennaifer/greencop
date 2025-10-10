<template>
  <AppLayout>
    <div class="max-w-xl mx-auto">
      <h2 class="title mb-4">Configuration du système</h2>
      <form class="space-y-4">
        <BaseInput label="Nom du client" placeholder="Ex: DataCenter Paris" v-model="clientName" />
        <BaseInput label="Adresse Kafka" placeholder="kafka://localhost:9092" v-model="kafkaUrl" />
        <BaseInput label="Nombre de capteurs" placeholder="Ex: 4" v-model="sensorCount" />
        <BaseButton label="Enregistrer" />
      </form>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const clientName = ref('')
const kafkaUrl = ref('')
const sensorCount = ref(0)
</script>
