<template>
  <div class="max-w-4xl mx-auto mt-20 p-4">
    <h1 class="text-2xl font-bold mb-4">💬 Chat global</h1>

    <div ref="messagesEl" class="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 text-gray-900 mb-4">
      <div v-for="msg in messages" :key="msg.id" class="py-1 border-b border-gray-200 last:border-0">
        <strong :class="{ 'text-gray-400 italic': msg.isDeleted }">
          {{ msg.username }}:
        </strong>
        <span class="ml-2">{{ msg.content }}</span>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="flex gap-2">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Écris un message..."
        maxlength="500"
        :disabled="!connected"
        class="flex-1 border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500 disabled:text-gray-500"
      />
      <button
        type="submit"
        :disabled="!connected || !newMessage.trim()"
        class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
      >
        Envoyer
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface ChatMessage {
  id: string
  content: string
  username: string
  senderId: string | null
  isDeleted: boolean
  createdAt: string
}

const messages = ref<ChatMessage[]>([])
const newMessage = ref('')
const connected = ref(false)
const messagesEl = ref<HTMLElement | null>(null)
let ws: WebSocket | null = null

async function loadHistory() {
  try {
    const data = await $fetch<ChatMessage[]>('/api/chat/messages')
    messages.value = data
    nextTick(() => scrollToBottom())
  } catch (e) {
    console.error('Erreur chargement historique:', e)
  }
}

function connect() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${protocol}//${location.host}/ws/chat`)

  ws.onopen = () => {
    connected.value = true
  }

  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data)
    
    if (payload.type === 'message') {
      messages.value.push({
        ...payload.data,
        isDeleted: false
      })
      nextTick(() => scrollToBottom())
    }
    
    // ← NOUVEAU : un user a été supprimé, on met à jour ses messages
    if (payload.type === 'user_deleted') {
      const oldUsername = payload.data.oldUsername
      
      // Trouve un label "USER DELETE N" qui n'est pas déjà utilisé
      const existingDeletedLabels = new Set(
        messages.value
          .filter(m => m.isDeleted)
          .map(m => m.username)
      )
      
      let label = 'USER DELETE'
      let counter = 1
      while (existingDeletedLabels.has(label)) {
        label = `USER DELETE ${counter}`
        counter++
      }
      
      // Met à jour tous les messages de l'utilisateur supprimé
      messages.value = messages.value.map(m => {
        if (m.username === oldUsername && !m.isDeleted) {
          return { ...m, username: label, senderId: null, isDeleted: true }
        }
        return m
      })
    }
  }

  ws.onclose = () => {
    connected.value = false
  }
}

function sendMessage() {
  if (!newMessage.value.trim() || !ws) return
  ws.send(JSON.stringify({ type: 'message', content: newMessage.value }))
  newMessage.value = ''
}

function scrollToBottom() {
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

onMounted(async () => {
  await loadHistory()
  connect()
})

onUnmounted(() => {
  if (ws) ws.close()
})
</script>