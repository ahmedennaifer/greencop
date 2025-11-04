import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null as null | {
      id: number
      username: string
      email: string
    },
    loading: false,
    error: '',
  }),

  actions: {
    async signup(username: string, email: string, password: string) {
      this.loading = true
      this.error = ''
      try {
        const res = await axios.post('/customers/register', {
          username,
          email,
          password,
        })
        console.log('Signup success:', res.data)
        router.push('/login')
      } catch (err: any) {
        this.error = err.response?.data?.detail || "Erreur lors de l'inscription."
        console.error('Signup error:', this.error)
      } finally {
        this.loading = false
      }
    },

    async login(email: string, password: string) {
      this.loading = true
      this.error = ''
      try {
        const res = await axios.post('/customers/login', {
          email,
          password,
        })
        this.token = res.data.access_token
        localStorage.setItem('token', this.token)

        // Optionnel : récupérer les infos utilisateur
        await this.fetchUserInfo(email)

        router.push('/')
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Erreur de connexion.'
        console.error('Login error:', this.error)
      } finally {
        this.loading = false
      }
    },

    async fetchUserInfo(email: string) {
      try {
        const res = await axios.get(`/customers/info/${email}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        this.user = res.data
      } catch (err) {
        console.error('Impossible de récupérer les infos utilisateur.')
      }
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      router.push('/login')
    },
  },
})
