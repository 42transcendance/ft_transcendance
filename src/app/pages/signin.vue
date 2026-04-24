<script setup lang="ts">
	const { create } = useAuth()
	const createEmail = ref('')
	const createUsername = ref('')
	const createPassword = ref('')

	const handleCreate = async () => {
		const createSuccess = await create(createEmail.value, createUsername.value, createPassword.value)

		if (createSuccess) {
			await navigateTo('/')
		}
		else {
			alert('Creation failed !')
		}
	}
</script>

<template>
	<div>
		<h1 class="title">Create User</h1>
		<form @submit.prevent="handleCreate" class="global-form">
			<input
				v-model="createEmail"
				type="email"
				placeholder="Email"
				class="email-input">
			<input
				v-model="createUsername"
				type="text"
				placeholder="Username"
				class="user-input">
			<input
				v-model="createPassword"
				type="password"
				placeholder="Password"
				class="pswd-input">
			<button type="submit" class="create-btn">Create</button>
		</form>
	</div>
</template>

<style scoped>
	.title {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.global-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}


	.email-input {
		padding: 10px 20px;
	}

	.user-input {
		padding: 10px 20px;
	}

	.pswd-input {
		padding: 10px 20px;
	}

	.create-btn {

	}
</style>

