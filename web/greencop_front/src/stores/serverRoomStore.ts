import { defineStore } from 'pinia'
import axios from 'axios'

interface ServerRoom {
  id: number
  name: string
  customer_id: number
  temperature?: number
  humidity?: number
  power?: number
}

export const useServerRoomStore = defineStore('serverRoom', {
  state: () => ({
    serverRooms: [] as ServerRoom[],
    loading: false,
    error: '',
  }),

  actions: {
    async createServerRoom(name: string, customer_id: number) {
      this.loading = true
      this.error = ''
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(
          '/server_rooms/new_room',
          {
            name,
            customer_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        console.log('✅ Server room créée:', res.data)
        await this.listServerRooms(customer_id)
        return res.data
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Erreur lors de la création.'
        console.error('❌ Erreur création server room:', this.error)
        throw err
      } finally {
        this.loading = false
      }
    },

    async getServerRoom(room_id: number) {
      this.loading = true
      this.error = ''
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`/server_rooms/room/${room_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log('✅ Server room récupérée:', res.data)
        return res.data
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Erreur lors de la récupération.'
        console.error('❌ Erreur récupération server room:', this.error)
        throw err
      } finally {
        this.loading = false
      }
    },

    async listServerRooms(customer_id: number) {
      this.loading = true
      this.error = ''
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`/server_rooms/list_rooms/${customer_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log('✅ Liste des server rooms:', res.data)
        this.serverRooms = res.data
        return res.data
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Erreur lors de la récupération.'
        console.error('❌ Erreur liste server rooms:', this.error)
        throw err
      } finally {
        this.loading = false
      }
    },

    async listServerRoomById(server_room_id: number) {
      this.loading = true
      this.error = ''
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`/server_rooms/list_room_by_id/${server_room_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log('✅ Server room par ID:', res.data)
        return res.data
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Erreur lors de la récupération.'
        console.error('❌ Erreur récupération server room par ID:', this.error)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateServerRoom(room_id: number, name: string, customer_id: number) {
      this.loading = true
      this.error = ''
      try {
        const token = localStorage.getItem('token')
        const res = await axios.put(
          `/server_rooms/update_room/${room_id}`,
          {
            name,
            customer_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        console.log('✅ Server room mise à jour:', res.data)
        await this.listServerRooms(customer_id)
        return res.data
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Erreur lors de la mise à jour.'
        console.error('❌ Erreur mise à jour server room:', this.error)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteServerRoom(room_id: number, customer_id: number) {
      this.loading = true
      this.error = ''
      try {
        const token = localStorage.getItem('token')
        const res = await axios.delete(`/server_rooms/delete_room/${room_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log('✅ Server room supprimée:', res.data)
        await this.listServerRooms(customer_id)
        return res.data
      } catch (err: any) {
        this.error = err.response?.data?.detail || 'Erreur lors de la suppression.'
        console.error('❌ Erreur suppression server room:', this.error)
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
