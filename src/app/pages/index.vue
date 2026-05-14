<script setup lang="ts">
	useHead({
		title: 'Home'
	})

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
	<div class="flex w-full h-full flex-col sm:flex-row items-start sm:items-center self-start sm:self-auto">
		<div class="flex w-full min-h-full h-full">
			<h1 class="font-gasoek text-6xl sm:text-9xl uppercase">Pixel, <br>fight!</h1>
		</div>
		<canvas class="webgl block absolute top-14 w-full left-0 sm:left-2/5 sm:w-3/5 h-[calc(100%-3.5rem)] overflow-hidden"></canvas>
	</div>
	<NuxtLink to="/game" :class="['font-gasoek border border-white bg-white text-blue-800 hover:bg-blue-800 hover:text-white text-4xl text-center uppercase inline-flex items-center justify-center h-20 absolute bottom-32 left-1/2 -translate-x-1/2 rounded-md w-52 pt-2.5 pb-2.5 pl-9 pr-9']"
		@mouseenter="isHovered = true"
		@mouseleave="isHovered = false"
	>
		{{ isHovered ? 'Fight!' : 'Play?' }}
	</NuxtLink>
</template>

<style scoped>
</style>
