<script setup lang="ts">
useHead({ title: 'Game' })

import { fillBackground, render } from '~/game/render'
import { GRID_INFO } from '~shared/game/constants'

definePageMeta({ middleware: 'auth' })

const { send, isConnected, pendingGameMessage } = useSocket()
const { gameQueueState, launchingTimer, gameTimerFormatted, resetToIdle, winner, painted, clicked } = useGameQueue()

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const gameState = gameQueueState

onMounted(() => {
	console.log('[game] onMounted, isConnected:', isConnected.value)
    console.log('[game] pendingGameMessage:', pendingGameMessage.value)
    pendingGameMessage.value = null
    if (isConnected.value)
        send({ type: 'sync_game' })
})

watch(isConnected, (connected) => {
	console.log('[game] isConnected changed:', connected)
	if (connected) {
		pendingGameMessage.value = null
        send({ type: 'sync_game' })
	}
})


watch(pendingGameMessage, async (state) => {
	if (!state)
		return

    if (state.type === 'sync_state') {
        if (state.gameState === 'playing' || state.gameState === 'finished') {
            await nextTick()
            if (canvas.value) {
                ctx = canvas.value.getContext('2d')!
                fillBackground(ctx)
                if (state.cells)
                    render(ctx, { type: 'cell_init', cells: state.cells })
            }
        }
        return
    }

    if (ctx)
		render(ctx, state)
})

watch(gameState, async (newState) => {
    if (newState === 'playing') {
        await nextTick()
        ctx = canvas.value!.getContext('2d')!
        fillBackground(ctx)
        send({ type: 'ready' })
    }
    if (newState === 'finished' || newState === 'idle') {
        ctx = null
    }
})

const paint = () => send({ type: 'paint' })

function handleFindMatch() {
    send({ type: 'join_game' })
}
</script>

<template>
  <div class="w-full flex flex-col items-center">
	<div v-if="gameState === 'syncing'">
        Connexion...
    </div>
    <div v-if="gameState === 'idle'">
        <button @click="handleFindMatch">Find a match !</button>
    </div>
    <div v-if="gameState === 'waiting'">
        Waiting for an opponent...
    </div>
    <div v-if="gameState === 'starting'">
        <p>The game is starting in {{ launchingTimer }} seconds!</p>
    </div>
    <div v-if="gameState === 'playing'" class="flex flex-col items-center">
		<canvas
			ref="canvas"
			:width="GRID_INFO.WIDTH * 2"
			:height="GRID_INFO.HEIGHT * 2"
			class="h-auto w-[90vw] md:w-[60vw] lg:w-[40vw]"
		/>
        <button @click="paint" class="w-[60vw] md:w-[30vw] lg:w-[15vw] py-3 mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold rounded-lg text-xl">
			PAINT
		</button>
        <p>{{ gameTimerFormatted }}</p>
    </div>
    <div v-if="gameState === 'finished'">
        Result !
        <p>The winner is {{ winner }} !</p>
        Stats:
        <p>Painted tiles : {{ painted }}</p>
        <p>Click number : {{ clicked }}</p>
		<div>
			<button @click="resetToIdle">Replay</button>
			<NuxtLink to="/" @click="resetToIdle">Back to home</NuxtLink>
		</div>
    </div>
  </div>
</template>
