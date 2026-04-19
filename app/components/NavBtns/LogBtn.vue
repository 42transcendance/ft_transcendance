<script setup lang="ts">
	const { currentUser, logout } = useAuth()
</script>

<template>
	<div class="log-wrapper">
		<button v-if="currentUser" @click="logout" class="log-btn">Logout</button>
		<NuxtLink v-else to="/login" class="log-btn">Login</NuxtLink>
	</div>
</template>

<style scoped>
.log-wrapper {
	display: block;
	width: 100%;
}

.log-btn {
	font-weight: bold;
    text-decoration: none;
    color: #333;
}

</style>
