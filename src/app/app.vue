<script setup lang="ts">
	const { currentUser } = useAuth()

	const data = await $fetch('/api/me')

    if (data)
		currentUser.value = data
</script>

<template>
        <NuxtLayout>
                <NuxtPage />
        </NuxtLayout>
</template>
