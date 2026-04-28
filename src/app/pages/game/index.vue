<script setup lang="ts">
import { fillBackground, render } from '~/game/render'
import { GRID_INFO } from '~/game/constants'

definePageMeta({ middleware: 'auth' })

const canvas = ref<HTMLCanvasElement | null>(null)
let ws: WebSocket | null = null

onMounted(() => {
  const ctx = canvas.value!.getContext('2d')!
  ws = new WebSocket('ws://localhost:3000/ws/game/1')
  fillBackground(ctx)
  
  ws.addEventListener('message', (event) => {
    const state = JSON.parse(event.data)
    render(ctx, state)
  })
})

onUnmounted(() => ws?.close())

const paint = () => {
  ws?.send(JSON.stringify({ type: 'paint' }))
}
</script>

<template>
  <div>
    <canvas
      ref="canvas"
      :width="GRID_INFO.WIDTH * 2"
      :height="GRID_INFO.HEIGHT * 2"
    />
    <button @click="paint">Paint</button>
  </div>
</template>