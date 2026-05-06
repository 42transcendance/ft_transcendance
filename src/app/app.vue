<script setup lang="ts">
	const { currentUser } = useAuth()
	const { notifyStatusUpdate, notifyUsernameUpdate, notifyAvatarUpdate } = useOnlineStatus()
	const { fetchFriends, updateFriendStatus, updateFriendProfile, friends, pendingSent, pendingReceived } = useFriends()

	// try to see if the user is already connected
	const { data } = await useFetch('/api/users/auth')
	if (data.value)
		currentUser.value = data.value.safeUser
	else
		currentUser.value = null

	//webSocket creation
	let socket: WebSocket | null = null
	let shouldReconnect = false
	let retryDelay = 1000
	let maxRetries = 6
	let retryCount = 0

	function connect() {
		if (!import.meta.client)
			return
		shouldReconnect = true

		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
		socket = new WebSocket(`${protocol}//${window.location.host}/ws/global`)

		socket.onopen = () => {
			console.log("✅ Connected")
			retryDelay = 1000
			retryCount = 0
		}

		socket.onclose = (event) => {
			if (shouldReconnect && !event.wasClean) {
				if (retryCount >= maxRetries) {
					console.log("❌ Reconnexion failed after 6 attempts, we won't try anymore mate")
					shouldReconnect = false
					socket = null
					return
				}
				retryCount++
				console.log(`🔄 Reconnexion attempt ${retryCount}/${maxRetries} in ${retryDelay / 1000}s...`)
				setTimeout(async () => {
					try {
						await $fetch('/api/users/auth')
						retryDelay = Math.min(retryDelay * 2, 30000)
						connect()
					} catch {
						console.error("Session lost or database reinitialized. Page reload...")
						window.location.reload()
					}
				}, retryDelay)
			}
		}

		socket.onerror = (error) => console.error("❌ WebSocket Error", error)

		socket.onmessage = (event) => {
			const message = JSON.parse(event.data)
			if (message.type === 'STATUS_CHANGE') {
				notifyStatusUpdate(message.userId, message.isOnline, message.lastSeenAt)
				if (currentUser.value)
					updateFriendStatus(message.userId, message.isOnline)
			}

			if (message.type === 'FRIEND_UPDATE') {
				fetchFriends()
			}

			if (message.type === 'USERNAME_UPDATE') {
				notifyUsernameUpdate(message.userId, message.username)
			}

			if (message.type === 'AVATAR_UPDATE') {
				notifyAvatarUpdate(message.userId, message.avatarUrl)
			}
		}
	}

	function disconnect() {
		shouldReconnect = false
		socket?.close()
		socket = null
	}

	//check if there is a change in currentUser
	watch(currentUser, (newUser) => {
		if (newUser && !socket) {
			connect()
			fetchFriends()
		} else if (!newUser && socket) {
			disconnect()
			friends.value = []
			pendingSent.value = []
			pendingReceived.value = []
		}
	}, { immediate: true })  //check at first render

	onUnmounted(() => disconnect())
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
