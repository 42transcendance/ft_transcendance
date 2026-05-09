<script setup lang="ts">
	useHead({
		title: 'Log in'
	})

	import FormField from '~/components/Form/FormField.vue'

	const { login } = useAuth()
	const username = ref('')
	const password = ref('')
	const userLoginError = ref('')

	const handleLogin = async () => {
		if (!username.value || !password.value) {
			userLoginError.value = 'Please fill in all fields'
			return
		}

		const { success, error } = await login(username.value, password.value)

		if (success) {
			userLoginError.value = ''
			await navigateTo('/')
		}
		else {
			userLoginError.value = 'Wrong username or password'
		}
	}
</script>

<template>
	<Card title="Login">
		<form @submit.prevent="handleLogin" class="flex flex-col gap-3">
			<FormField v-model="username" label="Username" placeholder="johndoe" type="text"/>
			<FormField v-model="password" label="Password" placeholder="" type="password"/>
			<FormButton label="Connect"/>
			<FormError v-if="userLoginError" :label="userLoginError" />
		</form>
	</Card>
</template>

<style scoped>
</style>
