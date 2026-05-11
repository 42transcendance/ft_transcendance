<template>
  <div class="max-w-4xl mx-auto mt-20 p-4">
    <h1 class="text-2xl font-bold mb-4">💬 Chat global</h1>

    <div ref="messagesEl" class="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 text-gray-900 mb-4">
      <div v-for="msg in messages" :key="msg.id" class="py-1 border-b border-gray-200 last:border-0">
        <span v-if="!msg.isDeleted"
			@click="handleOpenProfile(msg.senderId)"
            class="font-bold hover:text-blue-500 cursor-pointer transition-colors duration-150">
          {{ msg.username }}:
        </span>
		<span v-else class="text-gray-400 italic">
          {{ msg.username }}:
		</span>
        <span class="ml-2">{{ msg.content }}</span>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="flex gap-2">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Écris un message..."
        maxlength="500"
        :disabled="!isConnected"
        class="flex-1 border rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500 disabled:text-gray-500"
      />
      <button
        type="submit"
        :disabled="!isConnected || !newMessage.trim()"
        class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
      >
        Envoyer
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
useHead({
	title: 'Chat'
})

definePageMeta({
  middleware: 'auth'
})

const { data, error } = await useFetch('/api/users/auth')
if (error.value || !data.value)
    await navigateTo('/login')

const { send, isConnected, pendingChatMessage } = useSocket()
const { openProfile } = useProfile()
const { pendingUsernameUpdate } = useOnlineStatus()

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
const messagesEl = ref<HTMLElement | null>(null)

watch(pendingChatMessage, (payload) => {
    if (!payload)
		return

    if (payload.type === 'message') {
        messages.value.push({
			...payload.data,
			isDeleted: false
		})
        nextTick(() => scrollToBottom())
    }

    if (payload.type === 'user_deleted') {
        const existingDeletedLabels = new Set(
            messages.value
				.filter(m => m.isDeleted)
				.map(m => m.username)
        )
        let label = 'USER DELETED'
        let counter = 1
        while (existingDeletedLabels.has(label)) {
            label = `USER DELETED ${counter}`
            counter++
        }
        messages.value = messages.value.map(m => {
            if (m.username === payload.data.oldUsername && !m.isDeleted)
                return { ...m, username: label, senderId: null, isDeleted: true }
            return m
        })
    }
})


async function loadHistory() {
  try {
    const data = await $fetch<ChatMessage[]>('/api/chat/messages')
    messages.value = data
    nextTick(() => scrollToBottom())
  } catch (e) {
    console.error('Erreur chargement historique:', e)
  }
}

function sendMessage() {
	if (!newMessage.value.trim())
		return
	send({ type: 'message', content: newMessage.value })
	newMessage.value = ''
}

function scrollToBottom() {
	if (messagesEl.value) {
		messagesEl.value.scrollTop = messagesEl.value.scrollHeight
	}
}

onMounted(async () => {
	await loadHistory()
})

async function handleOpenProfile(userId: string) {
	const data = await $fetch(`/api/users/${userId}`)
	if (data)
		openProfile(data)
}

watch(pendingUsernameUpdate, (update) => {
    if (update) {
        messages.value = messages.value.map(m => {
            if (m.senderId === update.userId) {
                return { 
                    ...m, 
                    username: update.username 
                }
            }
            return m
        })
    }
})

</script>
