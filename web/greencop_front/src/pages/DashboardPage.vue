<template>
  <AppLayout>
    <div
      class="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-green-900 text-black p-6 space-y-10"
    >
      <!-- Titre et actions -->
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold text-white drop-shadow-lg">Dashboard</h2>
        <button
          @click="showCreateModal = true"
          class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition duration-200 shadow-lg"
        >
          <span class="text-xl">+</span>
          Créer une salle
        </button>
      </div>

      <!-- Message d'erreur -->
      <div v-if="serverRoomStore.error" class="bg-red-500/80 text-white p-4 rounded-lg">
        {{ serverRoomStore.error }}
      </div>

      <!-- Message de succès -->
      <div v-if="successMessage" class="bg-green-500/80 text-white p-4 rounded-lg">
        {{ successMessage }}
      </div>

      <!-- Loading -->
      <div v-if="serverRoomStore.loading" class="text-white text-center text-lg">Chargement...</div>

      <!-- Server rooms -->
      <section>
        <h3 class="text-2xl font-semibold text-white mb-4">Salles serveurs</h3>
        <div
          v-if="serverRoomStore.serverRooms.length === 0 && !serverRoomStore.loading"
          class="text-white text-center p-8 bg-white/10 rounded-lg"
        >
          Aucune salle serveur disponible. Cliquez sur "Créer une salle" pour commencer.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="room in serverRoomStore.serverRooms"
            :key="room.id"
            class="relative bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/30 hover:scale-105 transform transition duration-300"
          >
            <!-- Boutons d'actions -->
            <div class="absolute top-4 right-4 flex gap-2">
              <button
                @click="openEditModal(room)"
                class="bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition duration-200"
                title="Modifier"
              >
                ✏️
              </button>
              <button
                @click="confirmDelete(room)"
                class="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition duration-200"
                title="Supprimer"
              >
                ✕
              </button>
            </div>

            <!-- Contenu de la carte -->
            <h4 class="text-xl font-semibold text-white mb-3 pr-20">{{ room.name }}</h4>
            <div class="space-y-1 text-white/80">
              <p>
                🌡️ Température : <span class="text-red-400">{{ room.temperature || 0 }} °C</span>
              </p>
              <p>
                💧 Humidité : <span class="text-blue-400">{{ room.humidity || 0 }} %</span>
              </p>
              <p>
                ⚡ Électricité : <span class="text-green-400">{{ room.power || 0 }} kWh</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Capteurs -->
      <section>
        <h3 class="text-2xl font-semibold text-white mb-4">Capteurs installés</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SensorCard
            v-for="sensor in sensors"
            :key="sensor.id"
            :room="sensor.room"
            :count="sensor.count"
            :status="sensor.status"
          />
        </div>
      </section>
    </div>

    <!-- Modal création/édition -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      @click.self="closeModals"
    >
      <div
        class="bg-gradient-to-br from-blue-800 to-green-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30"
      >
        <h3 class="text-2xl font-bold text-white mb-6">
          {{ showEditModal ? 'Modifier la salle' : 'Créer une nouvelle salle' }}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="text-white font-semibold mb-2 block">Nom de la salle</label>
            <input
              v-model="roomForm.name"
              type="text"
              placeholder="Ex: Salle A"
              class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="closeModals"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
            >
              Annuler
            </button>
            <button
              @click="showEditModal ? updateRoom() : createRoom()"
              :disabled="!roomForm.name.trim()"
              class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
            >
              {{ showEditModal ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal confirmation suppression -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      @click.self="showDeleteModal = false"
    >
      <div
        class="bg-gradient-to-br from-red-800 to-red-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30"
      >
        <h3 class="text-2xl font-bold text-white mb-4">Confirmer la suppression</h3>
        <p class="text-white/90 mb-6">
          Êtes-vous sûr de vouloir supprimer la salle <strong>{{ roomToDelete?.name }}</strong> ?
        </p>

        <div class="flex gap-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            Annuler
          </button>
          <button
            @click="deleteRoom"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/Layout/AppLayout.vue'
import SensorCard from '@/components/sensors/SensorCard.vue'
import { useServerRoomStore } from '@/stores/serverRoomStore'
import { useUserStore } from '@/stores/userStore'

const serverRoomStore = useServerRoomStore()
const userStore = useUserStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const successMessage = ref('')

const roomForm = ref({
  name: '',
  id: null as number | null,
})

const roomToDelete = ref<any>(null)

const sensors = [
  { id: 1, room: 'Salle A', count: 12, status: 'Actifs' },
  { id: 2, room: 'Salle B', count: 10, status: 'Actifs' },
  { id: 3, room: 'Salle C', count: 14, status: 'Actifs' },
]

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  roomForm.value = { name: '', id: null }
}

const openEditModal = (room: any) => {
  roomForm.value = {
    name: room.name,
    id: room.id,
  }
  showEditModal.value = true
}

const confirmDelete = (room: any) => {
  roomToDelete.value = room
  showDeleteModal.value = true
}

const createRoom = async () => {
  const customer_id = userStore.user?.id || Number(localStorage.getItem('userId'))
  if (!customer_id) {
    serverRoomStore.error = 'Utilisateur non connecté'
    return
  }

  try {
    await serverRoomStore.createServerRoom(roomForm.value.name, customer_id)
    successMessage.value = `Salle "${roomForm.value.name}" créée avec succès !`
    closeModals()
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erreur création:', error)
  }
}

const updateRoom = async () => {
  const customer_id = userStore.user?.id
  if (!customer_id || !roomForm.value.id) {
    serverRoomStore.error = 'Données manquantes'
    return
  }

  try {
    await serverRoomStore.updateServerRoom(roomForm.value.id, roomForm.value.name, customer_id)
    successMessage.value = `Salle modifiée avec succès !`
    closeModals()
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erreur modification:', error)
  }
}

const deleteRoom = async () => {
  const customer_id = userStore.user?.id
  if (!customer_id || !roomToDelete.value) {
    return
  }

  try {
    await serverRoomStore.deleteServerRoom(roomToDelete.value.id, customer_id)
    successMessage.value = `Salle "${roomToDelete.value.name}" supprimée avec succès !`
    showDeleteModal.value = false
    roomToDelete.value = null
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erreur suppression:', error)
  }
}

onMounted(async () => {
  const customer_id = userStore.user?.id
  if (customer_id) {
    await serverRoomStore.listServerRooms(customer_id)
  }
})
</script>
