<template>
  <AppLayout>
    <div
      class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-green-900 to-white text-black p-6"
    >
      <div
        class="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/30"
      >
        <h2 class="text-3xl font-bold text-center text-white mb-6">Profil utilisateur</h2>

        <div class="space-y-4 text-white/90">
          <p><span class="font-semibold">Nom :</span> {{ user.name }}</p>
          <p><span class="font-semibold">Email :</span> {{ user.email }}</p>
          <p><span class="font-semibold">Salles serveurs :</span> {{ user.rooms }}</p>
          <p><span class="font-semibold">Capteurs :</span> {{ user.sensors }}</p>
        </div>

        <div class="mt-6 text-center">
          <BaseButton label="Modifier le profil" @click="editProfile" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/Layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const user = {
  name: 'Adolo',
  email: 'adrien@datacenter.ai',
  rooms: 3,
  sensors: 36,
}

const editProfile = () => {
  console.log('Ouverture du formulaire de modification de profil...')
}
</script>
