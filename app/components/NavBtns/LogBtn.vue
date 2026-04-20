<script setup lang="ts">
	const { currentUser, logout } = useAuth()
</script>

<template>
	<div class="log-wrapper">
		<button v-if="currentUser" @click="logout" class="logout-btn">Logout</button>
		<NuxtLink v-else to="/login" class="login-btn">Login</NuxtLink>
	</div>
</template>

<style scoped>
.log-wrapper {
	display: block;
	width: 100%;
}

.login-btn {
	font-family: "Courier New";
	font-size: 16px;
	font-weight: bold;
    text-decoration: none;
    color: #333;
    cursor: pointer;
}

.logout-btn {
	font-family: "Courier New";
	font-size: 16px;
	font-weight: bold;
    text-decoration: none;
    color: #333;
    border: none;
    background: none;
    cursor: pointer;
}

</style>
