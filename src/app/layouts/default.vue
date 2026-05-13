<script setup lang="ts">
import RightCardProfile from '~/components/RightCardProfile.vue';
import RightCardChat from '~/components/RightCardChat.vue';
</script>

<template>
	<ClientOnly>
		<div class="min-h-screen w-full flex flex-col">
			<Navbar />
			<RightCardProfile />
			<RightCardChat />
			<NavBtnsNotifBtn />
			<GameQueuePopup />
			<main class="flex-1 p-8 pt-26 text-white flex items-center justify-center">
				<slot />
			</main>
			<footer
				class="text-center py-3 text-sm text-white border-t bg-blue-800 border-white/10 flex sm:flex-row justify-center gap-4 flex-wrap z-2">
				<NuxtLink to="/privacy" class="text-blue-100 no-underline hover:underline">Privacy Policy</NuxtLink>
				<span class="hidden sm:inline">·</span>
				<NuxtLink to="/terms" class="text-blue-100 no-underline hover:underline">Terms of Service</NuxtLink>
			</footer>
		</div>
	</ClientOnly>
</template>
