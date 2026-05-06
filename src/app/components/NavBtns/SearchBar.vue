<script setup lang="ts">
	// Var that updates the html if they change value
	const searchQuery = ref('')
	const profile = useProfile()

	// Function launched when 'enter' or 'Search' button is pressed
	async function searchUser() {
		if (!searchQuery.value)
			return

		try {
			//Get the id and navigate to the dedicated page
			const user = await $fetch(`/api/users/search?name=${searchQuery.value}`)
			if (!user)
			{
				searchQuery.value = ''
				setError("No user found !")
				return
			}

			profile.openProfile(user);
			searchQuery.value = ''
		}
		catch (e) {
			searchQuery.value = ''
			profile.setError("No user found !")
		}
	}
</script>

<template>
	<div class="search-wrapper">
		<form @submit.prevent="searchUser" class="search-form">
			<input 
			v-model="searchQuery" 
			type="text" 
			:placeholder="profile.errorMessage.value || 'Search a user...'"
			:class="['search-input', { 'put-error': profile.errorMessage.value }]"
			/>
			<button type="submit" class="search-button">Search</button>
		</form>
	</div>
</template>

<style scoped></style>
