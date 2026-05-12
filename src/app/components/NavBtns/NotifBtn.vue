<script setup lang="ts">
	const { pendingReceived, respondRequest, fetchFriends } = useFriends()
	const { pendingStatusUpdate, pendingUsernameUpdate, pendingAvatarUpdate } = useOnlineStatus()
	const { openProfile } = useProfile()

	const showPopup = ref(false)

	const localRequests = ref<any[]>([])
	const dismissing = ref<Set<string>>(new Set())

	watch(pendingReceived, (newVal) => {
		localRequests.value = newVal.filter(
			r => !dismissing.value.has(r.friendshipId)
		)
	}, { immediate: true, deep: true })

	const pendingCount = computed(() => pendingReceived.value.length)

	async function handleRespond(friendshipId: string, action: 'ACCEPTED' | 'DECLINED') {
		dismissing.value = new Set([...dismissing.value, friendshipId])
		localRequests.value = localRequests.value.filter(r => r.friendshipId !== friendshipId)

		await new Promise(resolve => setTimeout(resolve, 300))
		await respondRequest(friendshipId, action)
		dismissing.value.delete(friendshipId)
	}

	async function handleOpenFromNotif(userId: string) {
		showPopup.value = false
		const data = await $fetch(`/api/users/${userId}`)
		if (data)
			openProfile(data)
	}

	watch(pendingUsernameUpdate, (update) => {
		if (update) {
			const pend = pendingReceived.value.find(p => p.user.id === update.userId)
			if (pend) {
				pend.user.username = update.username
				pendingReceived.value = [...pendingReceived.value]
			}
		}
	})

	watch(pendingAvatarUpdate, (update) => {
		if (update) {
			const pend = pendingReceived.value.find(p => p.user.id === update.userId)
			if (pend) {
				pend.user.avatarUrl = update.avatarUrl
				pendingReceived.value = [...pendingReceived.value]
			}
		}
	})
</script>

<template>
	<div class="fixed top-18 right-5 z-2">
		<!-- La cloche — visible seulement si demandes en attente -->
		<Transition name="bounce">
			<button
				v-if="pendingCount > 0"
				class="w-12 h-12 p-2 rounded-full bg-white border-none shadow-md cursor-pointer flex items-center justify-center text-2xl hover:shadow-lg transition-shadow duration-200 m-4 right-0"
				@click="showPopup = true">
				 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="fill-blue-800">!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.<path d="M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z"/></svg>
				<span class="absolute top-3 right-4 bg-blue-200 text-blue-900 rounded-full w-[18px] h-[18px] text-[11px] font-semibold flex items-center justify-center">{{ pendingCount }}</span>
			</button>
		</Transition>

		<!-- Overlay + Popup -->
		<div v-if="showPopup" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[4000]" @click.self="showPopup = false">
			<div class="bg-blue-50 p-8 rounded-md w-[400px] max-h-[500px] overflow-y-auto flex flex-col gap-4 shadow-xl">
				<h3 class="text-center font-semibold text-base text-blue-900">Friend Requests</h3>
				<p v-if="localRequests.length === 0" class="text-center text-blue-400 italic text-sm">No pending requests</p>
				<TransitionGroup name="slide-out" tag="div" class="flex flex-col gap-3 overflow-hidden">
					<div
						v-for="req in localRequests"
						:key="req.friendshipId"
						class="flex items-center gap-3 p-3 border border-blue-200 rounded-md bg-white hover:bg-blue-100/50 transition-colors duration-150">
						<img
							:src="req.user.avatarUrl || '/default-avatar.jpg'"
							class="w-[42px] h-[42px] rounded-full object-cover cursor-pointer border-2 border-blue-200 flex-shrink-0"
							@click="handleOpenFromNotif(req.user.id)"
						/>
						<span
							class="flex-grow font-semibold text-blue-900 cursor-pointer hover:text-blue-700 transition-colors"
							@click="handleOpenFromNotif(req.user.id)">
							{{ req.user.username }}
						</span>
						<div class="flex gap-2">
							<button @click="handleRespond(req.friendshipId, 'ACCEPTED')" class="bg-green-600 text-white border-none rounded px-3 py-1.5 cursor-pointer text-base hover:bg-green-700 transition-colors duration-200">Accept</button>
							<button @click="handleRespond(req.friendshipId, 'DECLINED')" class="bg-red-600 text-white border-none rounded px-3 py-1.5 cursor-pointer text-base hover:bg-red-700 transition-colors duration-200">Refuse</button>
						</div>
					</div>
				</TransitionGroup>
				<button class="bg-blue-600 text-white border-none rounded-md px-2 py-2 cursor-pointer self-center hover:bg-blue-700 transition-colors duration-200" @click="showPopup = false">Close</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
</style>