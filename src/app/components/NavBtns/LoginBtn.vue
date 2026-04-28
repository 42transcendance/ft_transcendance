<script setup lang="ts"></script>

<template>
	<div class="login-wrapper">
		<NuxtLink to="/login" class="login-btn">Log in</NuxtLink>
	</div>
</template>

<style scoped>
	.login-wrapper {
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
</style>
