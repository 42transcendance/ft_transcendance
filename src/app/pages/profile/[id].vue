<script setup lang="ts">
	useHead({
		title: 'Profile'
	})

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
		if (update) {
			const friend = friends.value.find(f => f.user.id === update.userId)
			if (friend) {
				friend.user.isOnline = update.isOnline
				friends.value = [...friends.value]
			}
			if (user.value?.safeUser?.id === update.userId) {
				user.value = {
					...user.value,
					safeUser: {
						...user.value.safeUser,
						isOnline: update.isOnline,
						lastSeenAt: update.lastSeenAt
					}
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

	async function handleOpenProfile(userId: string) {
		const data = await $fetch(`/api/users/${userId}`)
		if (data)
			openProfile(data)
	}
</script>

<template>

		<Card :title="user?.safeUser?.username">
			<div class="flex flex-col gap-8">
				<div class="flex flex-col gap-4 items-center" >
					<img
						:src="previewImage || '/default-avatar.jpg'"
						alt="Avatar"
						class="w-32 aspect-square rounded-md"
					/>

					<NuxtLink v-if="isOwner" to="/profile/settings" class="block p-4 pt-2 pb-2 text-center text-white rounded-md bg-blue-600 hover:bg-blue-700">Modify</NuxtLink>
				</div>
				<!-- Friends section — visible only on own profile -->
				<div v-if="isOwner" class="text-blue-900">
					<div class="flex flex-row items-center justify-center gap-1">
						<h3 class="font-semibold text-lg text-center">Friends</h3>
						<div class="w-4 h-4 text-xs text-center text-white bg-blue-900 rounded-full flex flex-col items-center justify-center">{{ friends.length }}</div>
					</div>
					<div v-if="friends.length !== 0" class="flex flex-row max-w-2xl gap-3 flex-wrap justify-center">
						<div
							v-for="friend in friends"
							:key="friend.friendshipId"
							class="flex flex-col items-center gap-2 p-3 cursor-pointer hover:bg-gray-100 rounded transition"
							@click="handleOpenProfile(friend.user.id)"
						>
						<div class="relative">
							<img
								:src="friend.user.avatarUrl || '/default-avatar.jpg'"
								class="w-16 rounded-md"
							/>
							<div
								:class="[
									'absolute bottom-0 right-0 w-2 h-2 rounded-full',
									friend.user.isOnline ? 'bg-green-500 outline outline-green-400 shadow-md shadow-green-500' : 'bg-red-900 outline outline-red-500'
								]"
							/>
						</div>
						<span class="text-2xl font-bold">{{ friend.user.username }}</span>
						</div>
					</div>
				</div>
			</div>
		</Card>
</template>

<style scoped>
</style>
