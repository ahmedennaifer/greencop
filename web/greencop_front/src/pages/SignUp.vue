<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white"
  >
    <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-6">Inscription</h1>

      <form @submit.prevent="onSignup" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nom complet</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="Entrez votre email"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 rounded-lg bg-primary text-white font-semibold hover:bg-emerald-600 transition"
        >
          S’inscrire
        </button>
      </form>

      <p class="text-center text-sm text-white/70 mt-4">
        Déjà un compte ?
        <router-link to="/login" class="text-white underline hover:text-secondary">
          Connectez-vous ici
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')

const onSignup = () => {
  console.log('Inscription avec :', name.value, email.value)
}
</script>
