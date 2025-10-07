<template>
  <AppLayout>
    <div class="max-w-md mx-auto">
      <h2 class="title mb-4">Profil utilisateur</h2>
      <BaseCard>
        <p class="font-semibold">Nom : adolo</p>
        <p>Email : adrien@datacenter.ai</p>
        <BaseButton class="mt-4" label="Modifier le profil" />
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
</script>
