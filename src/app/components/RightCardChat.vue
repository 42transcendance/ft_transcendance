<script setup lang="ts">
const { isChatOpen, closeChat } = useChat()
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
        let label = 'deleted user'
        let counter = 1
        while (existingDeletedLabels.has(label)) {
            label = `deleted user ${counter}`
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

async function handleOpenProfile(userId: string) {
    const data = await $fetch(`/api/users/${userId}`)
    if (data)
        openProfile(data)
}

watch(pendingUsernameUpdate, (update) => {
    if (update) {
        messages.value = messages.value.map(m => {
            if (m.senderId === update.userId) {
                return { ...m, username: update.username }
            }
            return m
        })
    }
})

// Charge l'historique quand le chat s'ouvre pour la première fois
watch(isChatOpen, (isOpen) => {
    if (isOpen && messages.value.length === 0) {
        loadHistory()
    }
})
</script>

<template>
    <RightCard :isOpen="isChatOpen" :z-index="3" @close="closeChat">
        <div class="flex flex-col w-full h-full gap-4">
            <div ref="messagesEl" class="flex-1 overflow-y-auto rounded-lg p-3 bg-blue-50">
                <div v-for="msg in messages" :key="msg.id" class="py-1 border-b border-blue-200 last:border-0 text-sm">
                    <span v-if="!msg.isDeleted"
                        @click="handleOpenProfile(msg.senderId)"
                        class="font-bold hover:text-blue-800 text-blue-700 cursor-pointer transition-colors duration-150">
                        {{ msg.username }}:
                    </span>
                    <span v-else class="text-red-700 decoration-1">
                        <s>{{ msg.username }}</s>:
                    </span>
                    <span class="ml-1 -shadow-blue-900 break-words whitespace-normal">{{ msg.content }}</span>
                </div>
            </div>

            <form @submit.prevent="sendMessage" class="flex flex-col gap-2">
                <input
                    v-model="newMessage"
                    type="text"
                    placeholder="Écris un message..."
                    maxlength="500"
                    class="border rounded-lg px-3 py-2 bg-white text-blue-900 placeholder:text-gray-500 disabled:text-gray-500"
                />
                <button
                    type="submit"
                    class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
                >
                    Envoyer
                </button>
            </form>
        </div>
    </RightCard>
</template>

<style scoped>
</style>
