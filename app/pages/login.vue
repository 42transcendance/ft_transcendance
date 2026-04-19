<script setup lang="ts">
const { login } = useAuth()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
	const loginSuccess = login(username.value, password.value)

	if (loginSuccess) {
		await navigateTo('/')
	}
	else {
		alert('Wrong logs !')
	}

}

</script>

<template>
	<div>
		<h1>Login Page</h1>
		<form @submit.prevent="handleLogin">
			<input
				v-model="username"
				type="text"
				placeholder="Username"
				class="user-input">
			<input
				v-model="password"
				type="password"
				placeholder="Password"
				class="pswd-input">
			<button type="submit" class="login-btn">Connect</button>
		</form>
	</div>
</template>

<style scoped>
.user-input {

}

.pswd-input {

}

.login-btn {

}
</style>
