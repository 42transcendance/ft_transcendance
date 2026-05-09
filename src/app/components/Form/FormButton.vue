<script setup lang="ts">
defineProps<{
	label: string
}>()

defineEmits<{
	'update:modelValue': [value: string]
}>()
</script>

<template>
	<button
			class="bg-blue-600 outline outline-blue-700 rounded-md mt-4 p-2 hover:bg-blue-900 hover:cursor-pointer"
			:type="submit">{{ label }}</button> 
</template>
