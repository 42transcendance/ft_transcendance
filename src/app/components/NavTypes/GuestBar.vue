<script setup lang="ts">
const { currentUser, logout } = useAuth()
</script>

<template>
	<nav class="bg-white shadow-md p-4">
		<div class="flex justify-between items-center lg:flex-row">
			<div class="flex md:gap-12 gap-2">
				<NuxtLink to="/">Logo</NuxtLink>
				<NuxtLink to="/game">Play</NuxtLink>
				<NuxtLink to="/rules">Rules</NuxtLink>
			</div>
			<NavBtnsSearchBar v-if="currentUser" class="search-bar"/>
			<div class="flex md:gap-12 gap-2">
				<NuxtLink v-if="!currentUser" to="/login">Login</NuxtLink>
				<NuxtLink v-if="!currentUser" to="/signup">Signup</NuxtLink>
				<button v-if="currentUser" @click="logout" class="bg-none border-none cursor-pointer text-inherit p-0">Logout</button>
			</div>
		</div>
	</nav>
</template>

<style scoped></style>
