<script setup lang="ts">
const { isProfileOpen, selectedUser, closeProfile } = useProfile()
const { fetchFriends, sendRequest, respondRequest, removeFriend, getFriendshipStatus, getFriendshipId } = useFriends()
const { currentUser } = useAuth()
const { pendingStatusUpdate, pendingUsernameUpdate, pendingAvatarUpdate } = useOnlineStatus()
const friendActionError = ref('')
const avatar = computed(() => { return selectedUser.value?.safeUser?.avatarUrl || null })
const now = ref(new Date())
let timer: NodeJS.Timeout | null = null

// Friends functions

const friendshipStatus = computed(() => {
	if (!selectedUser.value?.safeUser?.id)
		return 'NONE'

	if (selectedUser.value.safeUser.id === currentUser.value?.id)
		return 'SELF'

	return getFriendshipStatus(selectedUser.value.safeUser.id)
})

const friendshipId = computed(() => {
	if (!selectedUser.value?.safeUser?.id)
		return null

	return getFriendshipId(selectedUser.value.safeUser.id)
})

async function handleSendRequest() {
	friendActionError.value = ''
	const { success, error } = await sendRequest(selectedUser.value.safeUser.id)
	if (!success)
		friendActionError.value = error
}

async function handleAccept() {
	friendActionError.value = ''
	const { success, error } = await respondRequest(friendshipId.value, 'ACCEPTED')
	if (!success)
		friendActionError.value = error
}

async function handleDecline() {
	friendActionError.value = ''
	const { success, error } = await respondRequest(friendshipId.value, 'DECLINED')
	if (!success)
		friendActionError.value = error
}

async function handleRemove() {
	friendActionError.value = ''
	const { success, error } = await removeFriend(friendshipId.value)
	if (!success)
		friendActionError.value = error
}



// Online Status functions
watch(pendingStatusUpdate, (change) => {
	if (change && selectedUser.value?.safeUser?.id === change.userId) {
		//change isOnline
		const newSafeUser = {
			...selectedUser.value.safeUser,
			isOnline: change.isOnline
		}
		//change lastSeenAt if user went offline
		if (!change.isOnline && change.lastSeenAt) {
			newSafeUser.lastSeenAt = change.lastSeenAt
		}
		//apply changes
		selectedUser.value = {
			...selectedUser.value,
			safeUser: newSafeUser
		}
	}
}, { immediate: true })

//handle lastSeenAt time change (update every 60 secondes)
const startTimer = () => {
	if (timer)
		return
	timer = setInterval(() => {
		now.value = new Date()
	}, 60000)
}

const stopTimer = () => {
	if (timer) {
		clearInterval(timer)
		timer = null
	}
}


watch(isProfileOpen, (isOpen) => {
	if (isOpen) {
		fetchFriends()
		now.value = new Date()
		startTimer()
	} else {
		stopTimer()
	}
}, { immediate: true })

const formatLastSeen = computed(() => {
	const date = selectedUser.value?.safeUser?.lastSeenAt
	if (!date)
		return ''

	const last = new Date(date)
	const diffMs = now.value.getTime() - last.getTime()

	const minutes = Math.floor(diffMs / (1000 * 60))
	const hours = Math.floor(diffMs / (1000 * 60 * 60))
	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
	const weeks = Math.floor(days / 7)
	const months = Math.floor(days / 30)
	const years = Math.floor(days / 365)

	if (minutes < 1)
		return 'Since a few seconds.'
	if (minutes < 60)
		return `Since ${minutes} minute${minutes > 1 ? 's' : ''}.`
	if (hours < 24)
		return `Since ${hours} hour${hours > 1 ? 's' : ''}.`
	if (days < 7)
		return `Since ${days} day${days > 1 ? 's' : ''}.`
	if (weeks < 4)
		return `Since ${weeks} week${weeks > 1 ? 's' : ''}.`
	if (months < 12)
		return `Since ${months} month${months > 1 ? 's' : ''}.`
	return `Since ${years} year${years > 1 ? 's' : ''}.`
})


// Username change function
watch(pendingUsernameUpdate, (update) => {
	if (update && selectedUser.value?.safeUser?.id === update.userId) {
		selectedUser.value = {
			...selectedUser.value,
			safeUser: {
				...selectedUser.value.safeUser,
				username: update.username,
			}
		}
	}
})

// Avatar change function
watch(pendingAvatarUpdate, (update) => {
	if (update && selectedUser.value?.safeUser?.id === update.userId) {
		selectedUser.value = {
			...selectedUser.value,
			safeUser: {
				...selectedUser.value.safeUser,
				avatarUrl: update.avatarUrl,
			}
		}
	}
})

</script>

<template>
	<RightCard :isOpen="isProfileOpen" @close="closeProfile">
		<div v-show="selectedUser" class="flex flex-col items-center gap-8">
			<div class="flex flex-col items-center gap-2">
				<h2 class="text-2xl font-bold">{{ selectedUser?.safeUser?.username }}</h2>
				<img :src="avatar || '/default-avatar.jpg'" alt="Avatar" class="w-1/3 rounded-md" />
			</div>

			<div class="flex flex-row items-center gap-3">
				<div class="w-2 h-2 rounded-full"
					:class="selectedUser?.safeUser?.isOnline ? 'bg-green-500 outline outline-green-400 shadow-md shadow-green-500' : 'bg-red-900 outline outline-red-500'" />
				<p v-if="!selectedUser?.safeUser?.isOnline" class="last-seen">{{ formatLastSeen }}</p>
			</div>

			<div class="flex flex-col items-center">
				<div v-if="friendshipStatus !== 'SELF'" class="flex items-center gap-2">
					<template v-if="friendshipStatus === 'NONE'">
						<button @click="handleSendRequest" class="block p-4 pt-2 pb-2 text-center text-white rounded-md bg-green-600 hover:bg-green-700">
							Add Friend
						</button>
					</template>

					<template v-if="friendshipStatus === 'PENDING_SENT'">
						<button class="block p-4 pt-2 pb-2 text-center text-white rounded-md bg-green-700" disabled>Pending...</button>
					</template>

					<template v-if="friendshipStatus === 'PENDING_RECEIVED'">
						<p class="friend-status-text">
							<strong>{{ selectedUser?.safeUser?.username }}</strong> sent you a friend request!
						</p>
						<div class="flex flex-col gap-2">
							<button @click="handleDecline" class="block p-4 pt-2 pb-2 text-center text-white rounded-md bg-red-600 hover:bg-red-700">Decline</button>
							<button @click="handleAccept" class="block p-4 pt-2 pb-2 text-center text-white rounded-md bg-green-600 hover:bg-green-700">Accept</button>
						</div>
					</template>

					<template v-if="friendshipStatus === 'ACCEPTED'">
						<button @click="handleRemove"
							class="block p-4 pt-2 pb-2 text-center text-white rounded-md bg-red-600 hover:bg-red-700">Remove
							Friend</button>
					</template>

					<p v-if="friendActionError">{{ friendActionError }}</p>
					<NuxtLink :to="`/profile/${selectedUser?.safeUser?.id}`"
						class="block p-4 pt-2 pb-2 text-center text-white rounded-md bg-blue-600 hover:bg-blue-700">
						Profile
					</NuxtLink>
				</div>
			</div>
		</div>
	</RightCard>
</template>


<style scoped>
</style>
