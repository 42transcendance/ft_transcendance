<script setup lang="ts">
useHead({ title: 'Game' })

import { fillBackground, render } from '~/game/render'
import { CANVAS } from '~shared/game/constants'

const isHovered = ref(false)


definePageMeta({ middleware: 'auth' })

const { send, whenReady, pendingGameMessage, isConnected } = useSocket()
const { gameQueueState, launchingTimer, gameTimerFormatted, resetToIdle, winner, painted, clicked, is_eq, winnerUsername, requestSync } = useGameQueue()

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const gameState = gameQueueState

onMounted(() => {
    requestSync()
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
  <div>
    <div v-if="gameState === 'idle'">
        <button class="bg-green-600 rounded-md mt-4 p-2 hover:bg-green-900 hover:cursor-pointer" @click="handleFindMatch">Find a match !</button>
    </div>
    <div v-else-if="gameState === 'waiting'">
        Waiting for an opponent...
    </div>
    <div v-else-if="gameState === 'starting'">
        <p>The game is starting in {{ launchingTimer }} seconds!</p>
    </div>
    <div v-else-if="gameState === 'playing'" class="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto px-4">
		<canvas
			ref="canvas"
			:width="CANVAS.WIDTH"
			:height="CANVAS.HEIGHT"
			class="w-full h-auto rounded-lg shadow-lg"
		/>
        <button @click="paint" :class="['font-gasoek border border-white bg-white text-blue-800 hover:bg-blue-800 hover:text-white text-4xl text-center uppercase inline-flex items-center justify-center h-20 absolute bottom-32 left-1/2 -translate-x-1/2 rounded-md w-52 pt-2.5 pb-2.5 pl-9 pr-9 cursor-pointer']"
		@mouseenter="isHovered = true"
		@mouseleave="isHovered = false"
	>
		{{ isHovered ? 'Splash!' : 'Paint?' }}
		</button>
        <p>{{ gameTimerFormatted }}</p>
    </div>
    <div v-else-if="gameState === 'finished'">
        <Card title="Game Results" class="text-blue-900">
            <div class="flex flex-col gap-4">
                <div v-if="!is_eq" class="text-center">
                    <p class="text-2xl font-bold text-green-600">The winner is {{ winnerUsername }} !</p>
                </div>
                <div v-else class="text-center">
                    <p class="text-2xl font-bold text-yellow-600">This game is a tie !</p>
                </div>
                <div class="">
                    <h2 class="font-semibold text-lg mb-2">Stats:</h2>
                    <p class="text-sm">Current tiles: <span class="font-bold">{{ painted }}</span></p>
                    <p class="text-sm">Total tiles: <span class="font-bold">{{ clicked }}</span></p>
                </div>
                <div class="flex gap-2 justify-center pt-2">
                    <button @click="resetToIdle" class="bg-green-700 rounded-md p-2 hover:bg-green-800 hover:cursor-pointer text-white text-center">
                        Replay
                    </button>
                    <NuxtLink to="/" @click="resetToIdle" class="bg-blue-700 rounded-md p-2 hover:bg-blue-800 hover:cursor-pointer text-white text-center">
                        Back to home
                    </NuxtLink>
                </div>
            </div>
        </Card>
    </div>
  </div>
</template>
