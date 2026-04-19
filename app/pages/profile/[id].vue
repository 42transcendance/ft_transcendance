<script setup lang="ts">
	//get all address informations
	const route = useRoute();
	//get data from the user
	const {data: user, error} = await useFetch(`/api/users/${route.params.id}`);
</script>

<template>
	<div v-if="user" style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;" class="profile-card">
		<NuxtLink to="/">Back to search</NuxtLink>
		<h2>Profil found :</h2>
		<img :src="user.avatar" alt="Avatar" width="100" />
		<p><strong>Pseudo :</strong> {{ user.username }}</p>
		<p><strong>Level :</strong> {{ user.level }}</p>
		<p><strong>Status :</strong> {{ user.status }}</p>
	</div>
	<div v-else-if="error">
		<p>Erreur : No user found</p>
		<NuxtLink to="/">Go Back</NuxtLink>
	</div>
</template>

<style scoped></style>
