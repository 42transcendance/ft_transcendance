<script setup lang="ts">
	const { isProfileOpen, selectedUser, closeProfile } = useProfile()
	const { fetchFriends, sendRequest, respondRequest, removeFriend, getFriendshipStatus, getFriendshipId } = useFriends()
	const { currentUser } = useAuth()
	const { pendingStatusUpdate, pendingUsernameUpdate, pendingAvatarUpdate } = useOnlineStatus()
	const friendActionError = ref('')
	const avatar = computed(() => {return selectedUser.value?.safeUser?.avatarUrl || null})
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


	watch (isProfileOpen, (isOpen) => {
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
    <div :class="['side-profile', { 'is-open': isProfileOpen }]">
        <div v-show="selectedUser" class="profile-content">
            <button class="close-btn" @click="closeProfile">×</button>

            <img :src="avatar || '/default-avatar.jpg'" alt="Avatar" class="avatar" />
            <h2 class="profile-title">{{ selectedUser?.safeUser?.username }}</h2>

            <div v-if="selectedUser?.safeUser?.isOnline" class="status-block">
                <span class="status-dot online"></span>
                <span class="status-text">Online</span>
            </div>
            <div v-else class="status-block">
                <span class="status-dot offline"></span>
                <span class="status-text">Offline</span>
                <p class="last-seen">{{ formatLastSeen }}</p>
            </div>

            <div class="divider"></div>

            <div v-if="friendshipStatus !== 'SELF'" class="friend-zone">

                <template v-if="friendshipStatus === 'NONE'">
                    <button @click="handleSendRequest" class="btn btn-green">
                        Add Friend
                    </button>
                </template>

                <template v-if="friendshipStatus === 'PENDING_SENT'">
                    <p class="friend-status-text">Friend request sent</p>
                    <button class="btn btn-gray" disabled>Pending...</button>
                </template>

                <template v-if="friendshipStatus === 'PENDING_RECEIVED'">
                    <p class="friend-status-text">
                        <strong>{{ selectedUser?.safeUser?.username }}</strong> sent you a friend request
                    </p>
                    <div class="btn-row">
                        <button @click="handleAccept" class="btn btn-green">Accept</button>
                        <button @click="handleDecline" class="btn btn-red">Decline</button>
                    </div>
                </template>

                <template v-if="friendshipStatus === 'ACCEPTED'">
                    <p class="friend-status-text">You are friends 🤝</p>
                    <button @click="handleRemove" class="btn btn-outline-red">Remove Friend</button>
                </template>

                <p v-if="friendActionError" class="error">{{ friendActionError }}</p>
            </div>

            <div class="spacer"></div>
            <NuxtLink :to="`/profile/${selectedUser?.safeUser?.id}`" class="go-to-profile">
                Go to profile →
            </NuxtLink>
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
    z-index: 2000;
    box-shadow: -5px 0 15px rgba(0,0,0,0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
}
.side-profile.is-open {
    transform: translateX(0);
}

.profile-content {
    height: 100%;
    padding: 60px 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
}

.close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 28px;
    border: none;
    background: none;
    cursor: pointer;
    color: #666;
}
.close-btn:hover { color: #333; }

.avatar {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #eee;
}

.profile-title {
    font-size: 1.2rem;
    text-align: center;
    margin: 0;
    color: #222;
}

.status-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
}
.status-dot.online  { background: #42b883; }
.status-dot.offline { background: #bbb; }

.status-text {
    font-size: 0.95rem;
    color: #555;
    display: flex;
    align-items: center;
}

.last-seen {
    font-style: italic;
    color: #aaa;
    font-size: 0.82rem;
    margin: 0;
}

.divider {
    width: 80%;
    height: 1px;
    background: #eee;
    margin: 4px 0;
}

.friend-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: center;
}

.friend-status-text {
    color: #555;
    font-size: 0.9rem;
    margin: 0;
}

.btn-row {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.btn {
    padding: 9px 22px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
}
.btn-green            { background: #42b883; color: white; }
.btn-green:hover      { background: #369a6e; }
.btn-red              { background: #e32b2b; color: white; }
.btn-red:hover        { background: #b52020; }
.btn-gray             { background: #ddd; color: #888; cursor: default; }
.btn-outline-red      { background: transparent; color: #e32b2b; border: 1px solid #e32b2b; }
.btn-outline-red:hover { background: #ffeaea; }

.error {
    color: red;
    font-size: 0.82rem;
    text-align: center;
}

.spacer {
    flex-grow: 1;
}

.go-to-profile {
    font-family: "Courier New";
    font-size: 0.95rem;
    font-weight: bold;
    text-decoration: none;
    color: #555;
    padding: 10px 0;
    width: 100%;
    text-align: center;
    border-top: 1px solid #eee;
    transition: color 0.2s;
}
.go-to-profile:hover { color: #42b883; }
</style>
