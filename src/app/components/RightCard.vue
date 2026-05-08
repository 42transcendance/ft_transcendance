<script setup lang="ts">
defineProps<{
	isOpen: boolean
}>()

defineEmits<{
	close: []
}>()
</script>

<template>
	<div class="fixed top-0 right-0 z-1 h-full bg-white/90 transition-transform duration-300 ease-in-out w-[25%] max-w-100 min-w-72 h-[calc(100vh-60px)]" :class="isOpen ? 'translate-x-0' : 'translate-x-full'">
		<button
			class="absolute top-14 left-4 text-3xl border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-700 leading-none"
			@click="$emit('close')">
			×
		</button>

		<div class="h-full p-28 px-6 flex flex-col items-center gap-3 box-border overflow-y-auto">
			<slot />
		</div>
	</div>
</template>