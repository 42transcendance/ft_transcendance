<script setup lang="ts">
	import FormField from '~/components/Form/FormField.vue'

	const { create } = useAuth()
	const createEmail = ref('')
	const createUsername = ref('')
	const createPassword = ref('')
	const confirmPassword = ref('')
	
	const handleCreate = async () => {
		if (createPassword.value != confirmPassword.value) {
			alert('Passwords don\'t match !')
			return
		}

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
	<Card title="Signup">
		<form @submit.prevent="handleCreate" class="flex flex-col gap-3">
			<FormField v-model="createEmail" label="Email" placeholder="john@example.com" type="email"/>
			<FormField v-model="createUsername" label="Username" placeholder="johndoe" type="text"/>
			<FormField v-model="createPassword" label="Password" placeholder="Enter password" type="password"/>
			<FormField v-model="confirmPassword" label="Confirm Password" placeholder="Confirm password" type="password"/>
			<FormButton label="Sign up"/>
		</form>
	</Card>
</template>

<style scoped>
</style>

