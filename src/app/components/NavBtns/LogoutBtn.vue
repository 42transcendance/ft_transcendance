<script setup lang="ts">
	const { logout } = useAuth()
</script>

<template>
	<div class="logout-wrapper">
		<button @click="logout" class="logout-btn">Logout</button>
	</div>

</template>

<style scoped>
	.logout-wrapper {
		display: block;
		width: 100%;
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
