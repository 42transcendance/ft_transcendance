<script setup lang="ts">
	import FormField from '~/components/Form/FormField.vue'

	const { login } = useAuth()
	const username = ref('')
	const password = ref('')

	const handleLogin = async () => {
		if (!username.value || !password.value) {
			alert('Please fill in all fields.')
			return
		}

		const loginSuccess = await login(username.value, password.value)

		if (loginSuccess) {
			await navigateTo('/')
		}
		else {
			alert('Wrong username or password.')
		}
	}
</script>

<template>
	<Card title="Login">
	<form @submit.prevent="handleLogin" class="flex flex-col gap-3">
		<FormField v-model="username" label="Username" placeholder="johndoe" type="text"/>
		<FormField v-model="password" label="Password" placeholder="" type="password"/>
		<FormButton label="Connect"/>
	</form>
	</Card>
</template>
<style scoped>
</style>