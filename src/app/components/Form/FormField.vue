<script setup lang="ts">
defineProps<{
	label: string
	placeholder: string
	modelValue?: string
	type?: string
}>()

defineEmits<{
	'update:modelValue': [value: string]
}>()
</script>

<template>
	<div class="flex flex-col">
		<label class="text-blue-900 w-full">{{ label }}</label>
		<input
			class=" outline outline-blue-900 rounded-md p-2 text-blue-900"
			:type="type || 'text'"
			:placeholder="placeholder"
			:value="modelValue"
			@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
		/>
	</div>
</template>
