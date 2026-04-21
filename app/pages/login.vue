<script setup lang="ts">
const { login } = useAuth()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
	const loginSuccess = await login(username.value, password.value)

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
		<h1 class="title">Log in</h1>
		<form @submit.prevent="handleLogin" class="global-form">
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

.user-input {
	padding: 10px 20px;
}

.pswd-input {
	padding: 10px 20px;
}

.login-btn {

}
</style>
