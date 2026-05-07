<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { initThreejs, cleanupThreejs } from '~/threejs/index/index.ts'

const isHovered = ref(false)

onMounted(() => {
	initThreejs()
})

onUnmounted(() => {
	cleanupThreejs()
})

</script>
<template>
	<div class="flex w-full flex-col sm:flex-row">
		<div class="flex w-full min-h-full h-full outline">
			<h1 class="text-8xl font-bold uppercase">Pixel, <br>fight!</h1>
		</div>
		<div class="flex w-full h-full">
			<canvas class="webgl block absolute top-14 sm:left-1/2 sm:w-1/2 left-0.5 w-full h-full"></canvas>
		</div>
	</div>
	<!-- <NuxtLink 
		to="/game" :class="[
			'border border-white bg-transparent hover:bg-white px-20 text-[38px] uppercase transition-colors inline-flex items-center justify-center h-20',
			isHovered ? 'text-blue-800' : 'text-white'
		]"
		@mouseenter="isHovered = true"
		@mouseleave="isHovered = false"
	>
		{{ isHovered ? 'Fight!' : 'Play?' }}
	</NuxtLink> -->
</template>

<style scoped>
</style>
