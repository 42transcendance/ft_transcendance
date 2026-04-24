<script setup lang="ts">
	const { currentUser } = useAuth()
</script>

<template>
	<div class="profile-wrapper">
		<NuxtLink :to="`/profile/${currentUser.id}`" class="profile-btn">Profile</NuxtLink>
	</div>
</template>

<style scoped>
	.profile-wrapper {
		display: block;
		width: 100%;
	}

	.profile-btn {
		font-family: "Courier New";
		font-size: 16px;
		font-weight: bold;
		text-decoration: none;
		color: #333;
		cursor: pointer;
	}
</style>

