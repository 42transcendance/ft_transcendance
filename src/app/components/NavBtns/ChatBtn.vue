<script setup lang="ts"></script>

<template>
	<div class="chat-wrapper">
		<NuxtLink to="/chat" class="chat-btn">Chat</NuxtLink>
	</div>
</template>

<style scoped>
	.chat-wrapper {
		display: block;
		width: 100%;
	}
	.chat-btn {
		font-family: "Courier New";
		font-size: 16px;
		font-weight: bold;
		text-decoration: none;
		color: #333;
		cursor: pointer;
	}
</style>