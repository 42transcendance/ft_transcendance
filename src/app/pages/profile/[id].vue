<script setup lang="ts">
	// middleware proctection
	definePageMeta({
		middleware: 'auth'
	})
	//get all address informations
	const route = useRoute();
	//get data from the user
	const {data: user, error} = await useFetch(`/api/users/${route.params.id}`);
</script>

<template>
	<div v-if="user" style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;" class="profile-card">
		<h2>Profil found :</h2>
		<img :src="user.safeUser.avatar" alt="Avatar" width="100" />
		<p><strong>Username :</strong> {{ user.safeUser.username }}</p>
		<p><strong>isOnline :</strong> {{ user.safeUser.isOnline }}</p>
		<p><strong>lastSeenAt :</strong> {{ user.safeUser.lastSeenAt }}</p>
		<NuxtLink to="/">Back to home</NuxtLink>
	</div>
	<div v-else-if="error">
		<p>Erreur : No user found</p>
		<NuxtLink to="/">Go Back</NuxtLink>
	</div>
</template>

<style scoped></style>
