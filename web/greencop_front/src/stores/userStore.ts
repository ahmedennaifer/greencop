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
        console.log(' Signup success:', res.data)
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

        // Récupérer l'ID utilisateur depuis le token ou la réponse
        // Si votre backend renvoie l'ID dans la réponse de login :
        if (res.data.user_id) {
          localStorage.setItem('userId', String(res.data.user_id))
          await this.fetchUserInfo()
        }

        router.push('/')
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Erreur de connexion.'
        console.error('Login error:', this.error)
      } finally {
        this.loading = false
      }
    },

    async fetchUserInfo() {
      try {
        const id = localStorage.getItem('userId')
        if (!id) {
          console.warn(' Aucun userId trouvé, impossible de charger le profil.')
          return
        }

        console.log(' Chargement des infos pour le userId:', id)

        const res = await axios.post(
          `/customers/info/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        )

        console.log(' Profil utilisateur récupéré:', res.data)
        this.user = res.data
      } catch (err: any) {
        console.error(' Erreur lors du fetchUserInfo:', err)
      }
    },

    // Fonction pour initialiser l'utilisateur au chargement de l'app
    async initUser() {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      if (token && userId) {
        this.token = token
        await this.fetchUserInfo()
      }
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      router.push('/login')
    },
  },
})
