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

<style scoped>

	.search-wrapper {
		display: flex;
		flex-grow: 1;
	}


	.search-form {
		display: flex;
		width: 100%;
	}
/* Search bar style */
	.search-input {
		flex-grow: 1;
		padding: 10px 15px;
		border: 1px solid #ddd;
		border-radius: 20px 0 0 20px;
		font-size: 14px;
		transition: all 0.3s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: #42b883;
	}

	.search-input.put-error {
		border-color: #ff4d4d;
		background-color: #fff5f5;
	}

	.search-input.put-error::placeholder {
		color: #ff4d4d;
	}


/* Search button style */
	.search-button {
		width: 10%;
		text-align: center;
		background-color: #333;
		color: white;
		border: none;
		padding: 10px;
		border-radius: 0 20px 20px 0;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.search-button:hover {
		background-color: #42b883;
	}
</style>
