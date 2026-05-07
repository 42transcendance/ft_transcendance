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
	<div class="flex w-full h-full flex-col sm:flex-row">
		<div class="flex sm:items-baseline sm:items-center w-full min-h-full h-full">
			<h1 class="font-gasoek text-9xl font-bold uppercase">Pixel, <br>fight!</h1>
		</div>
		<div class="flex w-full h-full">
			<canvas class="webgl block absolute top-14 sm:left-1/2 sm:w-1/2 left-0.5 w-full h-full"></canvas>
		</div>
	</div>
	<NuxtLink 
	to="/game" :class="[
			'font-gasoek border border-white bg-blue-800 hover:bg-white text-4xl text-center uppercase transition-colors inline-flex items-center justify-center h-20 absolute bottom-32 left-1/2 -translate-x-1/2 rounded-md pt-2.5 pb-2.5 pl-9 pr-9',
			isHovered ? 'text-blue-800' : 'text-white'
		]"
		@mouseenter="isHovered = true"
		@mouseleave="isHovered = false"
	>
		{{ isHovered ? 'Fight!' : 'Play?' }}
	</NuxtLink>
</template>

<style scoped>
</style>
