<script setup lang="ts">
	const { connect, disconnect, send, isConnected, pendingGameMessage, pendingChatMessage } = useSocket()
	const { currentUser } = useAuth()
	const { notifyStatusUpdate, notifyUsernameUpdate, notifyAvatarUpdate } = useOnlineStatus()
	const { fetchFriends, updateFriendStatus, updateFriendProfile, friends, pendingSent, pendingReceived } = useFriends()
	const { cancelQueue } = useGameQueue()

	// try to see if the user is already connected
	const { data } = await useFetch('/api/users/auth')
	if (data.value)
		currentUser.value = data.value.safeUser
	else
		currentUser.value = null


	function handleMessage(message: any) {
		if (message.type === 'STATUS_CHANGE') {
			notifyStatusUpdate(message.userId, message.isOnline, message.lastSeenAt)
			if (currentUser.value)
				updateFriendStatus(message.userId, message.isOnline)
		}
		if (message.type === 'FRIEND_UPDATE') {
			fetchFriends()
		}
		if (message.type === 'USERNAME_UPDATE')
			notifyUsernameUpdate(message.userId, message.username)
		if (message.type === 'AVATAR_UPDATE')
			notifyAvatarUpdate(message.userId, message.avatarUrl)

		if (['waiting', 'starting', 'playing', 'finished', 'stats',
				'cell_init', 'cell_update', 'sync_state', 'no_game'].includes(message.type)) {
			pendingGameMessage.value = message
		}

		if (['message', 'user_deleted'].includes(message.type)) {
			pendingChatMessage.value = message
		}
	}

	//check if there is a change in currentUser
	watch(currentUser, (newUser) => {
		if (newUser) {
			connect(handleMessage)
			fetchFriends()
		} else if (!newUser && isConnected.value) {
			cancelQueue()
			disconnect()
			friends.value = []
			pendingSent.value = []
			pendingReceived.value = []
		}
	}, { immediate: true })

	onUnmounted(() => disconnect())
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
