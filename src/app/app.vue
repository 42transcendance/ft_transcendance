<script setup lang="ts">
	const { currentUser } = useAuth()

	const { data } = await useFetch('/api/users/auth')

    if (data.value)
		currentUser.value = data.value.safeUser
</script>

<template>
        <NuxtLayout>
                <NuxtPage />
        </NuxtLayout>
</template>
