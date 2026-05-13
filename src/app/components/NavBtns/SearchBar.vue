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
	<div class="w-full max-w-96">
		<form @submit.prevent="searchUser" class="flex flex-row gap-2">
			<input 
			class="outline-1 outline-blue-800 p-2 pt-1 pb-1 rounded-md w-full"
			v-model="searchQuery" 
			type="text" 
			:placeholder="profile.errorMessage.value || 'Search a user...'"
			:class="['search-input', { 'put-error': profile.errorMessage.value }]"
			aria-label="Search for a user"
			/>
			<button type="submit" class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-blue-950 p-0" aria-label="Search user"><span class="sm:hidden"><i class="fa-solid fa-magnifying-glass"></i></span><span class="hidden sm:inline">Search</span></button>
		</form>
	</div>
</template>