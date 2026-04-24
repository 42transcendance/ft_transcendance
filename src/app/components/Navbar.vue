<script setup lang="ts">
	const { currentUser } = useAuth()
</script>



<template>
	<ClientOnly>
		<NavTypesUserBar v-if="currentUser" />
		<NavTypesGuestBar v-else />
		
		<template #fallback>
			<span>Charging...</span>
		</template>
	</ClientOnly>
</template>



<style scoped>
</style>
