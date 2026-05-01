<script setup lang="ts">
	const { isProfileOpen, selectedUser, closeProfile } = useProfile()
	const avatar = computed(() => {return selectedUser.value?.safeUser?.avatarUrl || null})
	const { pendingStatusChange } = useOnlineStatus()
	const now = ref(new Date())
    let timer: NodeJS.Timeout | null = null

	watch(pendingStatusChange, (change) => {
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


	watch (isProfileOpen, (isOpen) => {
		if (isOpen) {
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
		const hours   = Math.floor(diffMs / (1000 * 60 * 60))
		const days    = Math.floor(diffMs / (1000 * 60 * 60 * 24))
		const weeks   = Math.floor(days / 7)
		const months  = Math.floor(days / 30)
		const years   = Math.floor(days / 365)

		if (minutes < 1)
			return 'since a few seconds'
		if (minutes < 60)
			return `since ${minutes} minute${minutes > 1 ? 's' : ''}`
		if (hours < 24)
			return `since ${hours} hour${hours > 1 ? 's' : ''}`
		if (days < 7)
			return `since ${days} day${days > 1 ? 's' : ''}`
		if (weeks < 4)
			return `since ${weeks} week${weeks > 1 ? 's' : ''}`
		if (months < 12)
			return `since ${months} month${months > 1 ? 's' : ''}`
		return `since ${years} year${years > 1 ? 's' : ''}`
	})
</script>

<template>
	<div :class="['side-profile', { 'is-open': isProfileOpen }]">
		<div v-show="selectedUser" class="profile-content">
			<button class="close-btn" @click="closeProfile">×</button>

			<img :src="avatar || '/default-avatar.jpg'" alt="Avatar" class="avatar" />
			<h2 class="profile-title">Profil de {{ selectedUser?.safeUser?.username }}</h2>
			<div v-if="selectedUser?.safeUser?.isOnline" class="user-online">
				<p>Online 🟢</p>
			</div>
			<div v-else class="user-offline">
				<p>Offline 🔴</p>
				<p class="last-seen">{{ formatLastSeen }}</p>
			</div>
		</div>
	</div>
</template>


<style scoped>
	.side-profile {
		position: fixed;
		top: 60px;
		right: 0;
		width: 400px;
		height: calc(100vh - 60px);
		background: white;
		z-index: 2000; /* Plus haut que la navbar */
		box-shadow: -5px 0 15px rgba(0,0,0,0.1);

		/* L'animation : on déplace la boîte de 100% vers la droite */
		transform: translateX(100%);
		transition: transform 0.3s ease-in-out;
	}

	/* Quand la classe 'is-open' est ajoutée, on remet le X à 0 */
	.side-profile.is-open {
		transform: translateX(0);
	}

	.avatar {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #ddd;
		justify-content: center;
	}

	.profile-title {
		text-align: center;
		align-items: center;
		gap: 10px;
	}

	.profile-content {
		padding: 20px;
		padding-top: 60px; /* Pour ne pas être sous la navbar si besoin */
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.close-btn {
		position: absolute;
		top: 20px;
		right: 20px;
		font-size: 30px;
		border: none;
		background: none;
		cursor: pointer;
	}

	.user-online, .user-offline {
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		width: 100%;
	}

	.last-seen {
		font-style: italic;
		color: #949494;
		font-size: 0.90rem;
		margin-top: 2px;
	}
</style>
