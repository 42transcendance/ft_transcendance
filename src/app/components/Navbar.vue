<script setup lang="ts">
	const { currentUser, logout} = useAuth()

</script>

<template>
		<nav class="fixed w-full bg-white/90 p-4 pl-8 pr-8 z-2">
			<div class="flex justify-between items-center lg:flex-row">
			<div class="flex md:gap-12 gap-2">
				<NuxtLink to="/">Logo</NuxtLink>
				<NuxtLink to="/game">Play</NuxtLink>
				<NuxtLink to="/rules">Rules</NuxtLink>			</div>
			<NavBtnsSearchBar v-if="currentUser" class="search-bar"/>
			<div class="flex md:gap-12 gap-2">
				<NuxtLink v-if="!currentUser" to="/login">Login</NuxtLink>
				<NuxtLink v-if="!currentUser" to="/signup">Signup</NuxtLink>
				<NuxtLink v-if="currentUser" to="/chat">Chat</NuxtLink>
				<NuxtLink v-if="currentUser" :to="`/profile/${currentUser?.id}`">Profile</NuxtLink>
				<button v-if="currentUser" @click="logout" class="bg-none border-none cursor-pointer text-inherit p-0">Logout</button>
			</div>
		</div>
	</nav>
</template>

<style scoped></style>
