<script setup lang="ts">
	defineProps<{
		label: string
	}>()
</script>

<template>
	<p class="text-green-500 text-sm font-medium mt-1">
		{{ label }}
	</p>
</template>
