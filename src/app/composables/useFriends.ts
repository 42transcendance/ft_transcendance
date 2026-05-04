export const useFriends = () => {
	const friends = useState<any[]>('friends', () => [])
	const pendingSend = useState<any[]>('pendingSend', () => [])
	const pendingReceived = useState<any[]>('pendingReceived', () => [])
	const error = useState<string>('friendsError', () => '')

	const fetchFriends = async() => {
		try {
			const data = await $fetch('/api/friends')
			friends.value = data.friends
			pendingSend.value = data.pendingSend
			pendingReceived.value = data.pendingReceived
		} catch (e) {
			error.value = e.data?.message || 'Failed to load friends'
		}
	}


	const removeFriend = async(friendshipId: string) => {
		try {
			const data = await $fetch('/api/friends/remove', {
				method: 'DELETE',
				body: { friendshipId }
			})

			await fetchFriends()
			return { success: true }
		} catch (e) {
			return { success: false, error: e.data?.message || 'Failed to remove friend' }
		}
	}
	

	const sendRequest = async(receiverId: string) => {
		try {
			const data = await $fetch('/api/friends/request', {
				method: 'POST',
				body: { receiverId }
			})
			await fetchFriends()
			return { success: true }
		} catch (e) {
			return { success: false, error: e.data?.message || 'Failed to send request' }
		}
	}


	const respondRequest = async(friendshipId: string, action: 'ACCEPTED' | 'DECLINED') => {
		try {
			const data = await $fetch('/api/friends/respond', {
				method: 'PATCH',
				body: { friendshipId, action }
			})
			await fetchFriends()
			return { success: true }
		} catch (e) {
			return { success: false, error: e.data?.message || 'Failed to respond to request' }
		}
	}

	const getFriendshipStatus = (friendId: string) => {
		if (!friends.value || !pendingSend.value || !pendingReceived.value)
			return 'NONE'
		if (friends.value.find(f => f.id === friendId))
			return 'ACCEPTED'
		if (pendingSend.value.find(f => f.user.id === friendId))
			return 'PENDING_SENT'
		if (pendingReceived.value.find(f => f.user.id === friendId))
			return 'PENDING_RECEIVED'
		return 'NONE'
	}

	const getFriendshipId = (friendId: string) => {
		const inSent = pendingSend.value.find(f => f.user.id === friendId)
		if (inSent)
			return inSent.friendshipId

		const inReceived = pendingReceived.value.find(f => f.user.id === friendId)
		if (inReceived)
			return inReceived.friendshipId

		return null
	}

	return {
		friends,
		pendingSend,
		pendingReceived,
		error,
		fetchFriends,
		removeFriend,
		sendRequest,
		respondRequest,
		getFriendshipStatus,
		getFriendshipId
	}
}
