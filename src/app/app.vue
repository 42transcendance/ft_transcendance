<script setup lang="ts">
	const { currentUser } = useAuth()
	const { updateUserStatus } = useOnlineStatus()
	const { data } = await useFetch('/api/users/auth')
	if (data.value)
		currentUser.value = data.value.safeUser


	//webSocket creation
	let socket: WebSocket | null = null
	let shouldReconnect = false
	let retryDelay = 1000
	let maxRetries = 5
	let retryCount = 0

	function connect() {
		if (!import.meta.client)
			return
		shouldReconnect = true

		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
		socket = new WebSocket(`${protocol}//${window.location.host}/ws/global`)

		socket.onopen = () => {
			console.log("✅ Connecté au canal de statut global")
			retryDelay = 1000
			retryCount = 0
		}

		socket.onclose = (event) => {
			if (shouldReconnect && !event.wasClean) {
				if (retryCount >= maxRetries) {
					console.log("❌ Connexion impossible après 5 tentatives, abandon.")
					shouldReconnect = false
					socket = null
					return
				}
				retryCount++
				console.log(`🔄 Tentative ${retryCount}/${maxRetries} de reconnexion dans ${retryDelay / 1000}s...`)
				setTimeout(() => {
					retryDelay = Math.min(retryDelay * 2, 30000)
					connect()
				}, retryDelay)
			}
		}

		socket.onerror = (error) => console.error("❌ Erreur WebSocket", error)

		socket.onmessage = (event) => {
			const message = JSON.parse(event.data)
			if (message?.type === 'STATUS_CHANGE') {
				updateUserStatus(message.userId, message.isOnline)
			}
		}
	}

	function disconnect() {
		shouldReconnect = false
		socket?.close()
		socket = null
	}

	// ← C'est ici que tout se joue
	watch(currentUser, (newUser) => {
		if (newUser && !socket) {
			connect()       // l'utilisateur vient de se connecter
		} else if (!newUser && socket) {
			disconnect()    // l'utilisateur vient de se déconnecter
		}
	}, { immediate: true })  // immediate: true = vérifie aussi au premier rendu

	onUnmounted(() => disconnect())
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
