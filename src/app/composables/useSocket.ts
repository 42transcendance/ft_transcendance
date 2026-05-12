const pendingGameMessage = ref<any>(null)
const pendingChatMessage = ref<any>(null)

let socket: WebSocket | null = null
let shouldReconnect = false
let retryDelay = 1000
let retryCount = 0
const maxRetries = 6
const isConnected = ref(false)

export const useSocket = () => {
    // Envoie un message — utilisable depuis n'importe quel composant
    function send(message: object) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message))
        } else {
            console.warn('Socket not connected, message dropped:', message)
        }
    }

    function connect(onMessage: (message: any) => void) {
        if (!import.meta.client)
			return
        shouldReconnect = true

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        socket = new WebSocket(`${protocol}//${window.location.host}/ws`)

        socket.onopen = () => {
			isConnected.value = true
            console.log("✅ Connected")
            retryDelay = 1000
            retryCount = 0
        }

        socket.onclose = (event) => {
			isConnected.value = false
            if (shouldReconnect && !event.wasClean) {
                if (retryCount >= maxRetries) {
                    shouldReconnect = false
                    socket = null
                    return
                }
                retryCount++
                setTimeout(async () => {
                    try {
                        await $fetch('/api/users/auth')
                        retryDelay = Math.min(retryDelay * 2, 30000)
                        connect(onMessage)
                    } catch {
                        window.location.reload()
                    }
                }, retryDelay)
            }
        }

        socket.onerror = (error) => console.error("❌ WebSocket Error", error)

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data)
            onMessage(message)
        }
    }

    function disconnect() {
        shouldReconnect = false
        socket?.close()
        socket = null
		isConnected.value = false
    }

    return {
		connect,
		disconnect,
		send,
		isConnected,
		pendingGameMessage,
		pendingChatMessage
	}
}
