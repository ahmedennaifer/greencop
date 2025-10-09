<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-green-900 to-white text-black"
  >
    <div
      class="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
    >
      <h1 class="text-3xl font-bold text-center mb-6 text-white">Connexion</h1>

      <form @submit.prevent="onLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-white">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="Entrez votre email"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-white">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 rounded-lg bg-primary text-white font-semibold hover:bg-emerald-600 transition"
        >
          Se connecter
        </button>
      </form>

      <p class="text-center text-sm text-white/70 mt-4">
        Pas encore de compte ?
        <router-link to="/signup" class="text-secondary underline hover:text-blue-400">
          Créez-en un ici
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const onLogin = () => {
  console.log('Connexion avec :', email.value, password.value)
}
</script>
