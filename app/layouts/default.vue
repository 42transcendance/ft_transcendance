<script setup lang="ts"></script>

<template>
	<div>
		<Navbar />
		<Profile />
		<main class="main-content">
    		<slot />
		</main>
	</div>
</template>

<style scoped>
.main-content {
	margin-top: 60px;
	padding: 20px;
}

</style>
