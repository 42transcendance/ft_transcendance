<script setup lang="ts"></script>

<template>
	<ClientOnly>
		<div class="h-screen w-screen flex flex-col">
			<Navbar />
			<Profile />
			<NavBtnsNotifBtn />
			<main class="flex-1 p-8 text-white h-full">
				<slot />
			</main>
			<footer
				class="text-center py-3 text-sm text-white border-t border-blue-600 flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
				<NuxtLink to="/privacy" class="text-blue-100 no-underline hover:underline">Privacy Policy</NuxtLink>
				<span class="hidden sm:inline">·</span>
				<NuxtLink to="/terms" class="text-blue-100 no-underline hover:underline">Terms of Service</NuxtLink>
			</footer>
		</div>
	</ClientOnly>
</template>

<style scoped>
</style>
