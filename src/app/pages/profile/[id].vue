<script setup lang="ts">
	definePageMeta({ middleware: 'auth' })

	const route = useRoute()
	const { currentUser } = useAuth()
	const { friends, fetchFriends } = useFriends()
	const { openProfile } = useProfile()
	const { pendingStatusUpdate, pendingUsernameUpdate, pendingAvatarUpdate } = useOnlineStatus()

	const { data: user, error } = await useFetch(`/api/users/${route.params.id}`)
	if (error.value)
		throw createError({ statusCode: 404, message: 'User not found' })

	const isOwner = computed(() =>
		String(currentUser.value?.id) === String(route.params.id)
	)

	onMounted(() => {
		if (isOwner.value)
			fetchFriends()
	})

	const previewImage = ref<string | null>(user?.value?.safeUser?.avatarUrl || null)

	watch(pendingStatusUpdate, (update) => {
		if (update && user.value?.safeUser?.id === update.userId) {
			user.value = {
				...user.value,
				safeUser: {
					...user.value.safeUser,
					isOnline: update.isOnline,
					lastSeenAt: update.lastSeenAt
				}
			}
		}
	})

	watch(pendingUsernameUpdate, (update) => {
		if (update) {
			const friend = friends.value.find(f => f.user.id === update.userId)
			if (friend) {
				friend.user.username = update.username
				friends.value = [...friends.value]
			}
			if (user.value?.safeUser?.id === update.userId) {
				user.value = {
					...user.value,
					safeUser: {
						...user.value.safeUser,
						username: update.username
					}
				}
			}
		}
	})

	watch(pendingAvatarUpdate, (update) => {
		if (update) {
			const friend = friends.value.find(f => f.user.id === update.userId)
			if (friend) {
				friend.user.avatarUrl = update.avatarUrl
				friends.value = [...friends.value]
			}
			if (user.value?.safeUser?.id === update.userId) {
				previewImage.value = update.avatarUrl
				user.value = {
					...user.value,
					safeUser: {
						...user.value.safeUser,
						avatarUrl: update.avatarUrl
					}
				}
			}
		}
	})
</script>

<template>
    <div class="profile-wrapper">
        <h1 class="profile-title">
            {{ isOwner ? 'Your Profile' : `${user?.safeUser?.username}'s Profile` }}
        </h1>

        <div class="avatar-section">
            <img
                :src="previewImage || '/default-avatar.jpg'"
                alt="Avatar"
                class="avatar-preview"
            />
        </div>

        <div class="info-section">
            <p><strong>Username :</strong> {{ user?.safeUser?.username }}</p>
            <template v-if="isOwner">
                <NuxtLink to="/profile/settings">Modify</NuxtLink>
            </template>
        </div>

        <!-- Liste d'amis — visible seulement sur son propre profil -->
        <div v-if="isOwner" class="friends-section">
            <h2 class="friends-title">Friends ({{ friends.length }})</h2>

            <p v-if="friends.length === 0" class="no-friends">
                You have no friends yet.
            </p>

            <div v-else class="friends-grid">
                <div
                    v-for="friend in friends"
                    :key="friend.friendshipId"
                    class="friend-card"
                    @click="openProfile({ safeUser: friend.user })">

                    <div class="friend-avatar-wrapper">
                        <img
                            :src="friend.user.avatarUrl || '/default-avatar.jpg'"
                            class="friend-avatar"
                        />
                        <!-- Pastille statut online -->
                        <span
                            :class="['status-dot', friend.user.isOnline ? 'online' : 'offline']">
                        </span>
                    </div>

                    <div class="friend-info">
                        <span class="friend-username">{{ friend.user.username }}</span>
                        <span :class="['friend-status', friend.user.isOnline ? 'online' : 'offline']">
                            {{ friend.user.isOnline ? 'Online' : 'Offline' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-wrapper {
    border: 1px solid #ccc;
    padding: 20px;
    margin-top: 10px;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
}

.profile-title {
    text-align: center;
    gap: 20px;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.avatar-preview {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #ddd;
}

.info-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

/* --- Section amis --- */
.friends-section {
    margin-top: 30px;
    border-top: 1px solid #eee;
    padding-top: 20px;
}

.friends-title {
    text-align: center;
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: #333;
}

.no-friends {
    text-align: center;
    color: #aaa;
    font-style: italic;
}

.friends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
}

.friend-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 10px;
    cursor: pointer;
    transition: box-shadow 0.2s, border-color 0.2s;
}

.friend-card:hover {
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-color: #42b883;
}

.friend-avatar-wrapper {
    position: relative;
    flex-shrink: 0;
}

.friend-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ddd;
}

/* Petite pastille verte/grise en bas à droite de l'avatar */
.status-dot {
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 2px solid white;
}
.status-dot.online  { background: #42b883; }
.status-dot.offline { background: #bbb; }

.friend-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;  /* permet le text-overflow */
}

.friend-username {
    font-weight: bold;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.friend-status {
    font-size: 0.75rem;
}
.friend-status.online  { color: #42b883; }
.friend-status.offline { color: #bbb; }
</style>
