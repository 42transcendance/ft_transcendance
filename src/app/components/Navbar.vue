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
	<nav class="navbar">
		<NavBtnsHomeBtn class="home-btn"/>

		<form @submit.prevent="searchUser" class="search-form">
			<input 
			v-model="searchQuery" 
			type="text" 
			:placeholder="profile.errorMessage.value || 'Search a user...'"
			:class="['search-input', { 'put-error': profile.errorMessage.value }]"
			/>
			<button type="submit" class="search-button">Search</button>
		</form>

		<NavBtnsLogBtn class="log-btn"/>
	</nav>	
</template>



<style scoped>

/* Navigation bar style */
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 60px;
		background-color: #ffffff;
		z-index: 3000;
		display: flex;
		align-items: center;
		box-shadow: 0 2px 5px rgba(0,0,0,0.1);
		padding: 0 20px;
		box-sizing: border-box;
	}

/* Home button style */
	.home-btn {
		width: 6%;
		text-align: center;
	}

/* Search form (Search bar and search button) style */
	.search-form {
		display: flex;
		flex-grow: 1;
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


/* Log button style */
	.log-btn {
		width: 6%;
		text-align: center;
	}

</style>
