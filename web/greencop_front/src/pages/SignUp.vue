<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-green-900 to-white text-black"
  >
    <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-6 text-white">Inscription</h1>

      <form @submit.prevent="onSignup" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-white">Nom d'utilisateur</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-white">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Entrez votre email"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-white">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition"
          :disabled="userStore.loading"
        >
          <span v-if="userStore.loading">Inscription...</span>
          <span v-else>S'inscrire</span>
        </button>

        <p v-if="userStore.error" class="text-red-400 text-center text-sm mt-2">
          {{ userStore.error }}, {{ console.log(userStore.error) }}
        </p>
      </form>

      <p class="text-center text-sm text-white mt-4">
        Déjà un compte ?
        <router-link to="/login" class="text-emerald-300 underline hover:text-emerald-500">
          Connectez-vous
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const username = ref('')
const email = ref('')
const password = ref('')
const userStore = useUserStore()

const onSignup = async () => {
  await userStore.signup(username.value, email.value, password.value)
}
</script>
