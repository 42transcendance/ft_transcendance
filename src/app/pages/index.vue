<script setup lang="ts">
import { ref } from 'vue'

const isHovered = ref(false)
</script>

<template>
	<div class="flex w-full flex-col sm:flex-row">
		<div class="flex w-full">
			<h1 class="text-8xl font-bold underline">Pixel, fight!</h1>
		</div>
		<div class="flex w-full">
			<h1 class="text-8xl font-bold underline">Threejs</h1>
		</div>
	</div>
	<NuxtLink 
		to="/game" 
		:class="[
			'border border-white oklch(42.4% 0.199 265.638) hover:bg-white px-20 text-[38px] uppercase transition-colors inline-flex items-center justify-center h-20 rounded-sm text-center',
			isHovered ? 'text-blue-900' : 'text-black'
		]"
		@mouseenter="isHovered = true"
		@mouseleave="isHovered = false"
	>
		{{ isHovered ? 'Fight!' : 'Play?' }}
	</NuxtLink>
</template>

<style scoped>
</style>
