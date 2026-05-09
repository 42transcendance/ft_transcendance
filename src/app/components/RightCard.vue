<script setup lang="ts">
defineProps<{
	isOpen: boolean
}>()

defineEmits<{
	close: []
}>()
</script>

<template>
	<div class="fixed top-0 right-0 z-3 bg-white transition-transform duration-300 ease-in-out h-full w-[25%] max-w-100 min-w-72" :class="isOpen ? 'translate-x-0' : 'translate-x-full'">
		<button
			class="absolute top-8 left-8 text-3xl border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-700 leading-none"
			@click="$emit('close')">
			×
		</button>

		<div class="h-full p-28 px-6 flex flex-col items-center gap-3 box-border overflow-y-auto">
			<slot />
		</div>
	</div>
</template>