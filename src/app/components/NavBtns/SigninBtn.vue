<script setup lang="ts"></script>

<template>
	<div class="signin-wrapper">
		<NuxtLink to="/signin" class="signin-btn">Sign in</NuxtLink>
	</div>
</template>

<style scoped>
	.signin-wrapper {
		display: block;
		width: 100%;
	}

	.signin-btn {
		font-family: "Courier New";
		font-size: 16px;
		font-weight: bold;
		text-decoration: none;
		color: #333;
		cursor: pointer;
	}
</style>

