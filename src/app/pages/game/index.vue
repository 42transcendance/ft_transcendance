<script setup lang="ts">
useHead({ title: 'Game' })

import { fillBackground, render } from '~/game/render'
import { CANVAS } from '~shared/game/constants'

definePageMeta({ middleware: 'auth' })

const { send, whenReady, pendingGameMessage, isConnected } = useSocket()
const { gameQueueState, launchingTimer, gameTimerFormatted, resetToIdle, winner, painted, clicked, winnerUsername, requestSync } = useGameQueue()

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
  <div class="w-full flex flex-col items-center">
	<div v-if="gameState === 'syncing'">
        Connexion...
    </div>
    <div v-else-if="gameState === 'idle'">
        <button @click="handleFindMatch">Find a match !</button>
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
        <button @click="paint" tabindex="-1">
			PAINT
		</button>
        <p>{{ gameTimerFormatted }}</p>
    </div>
    <div v-else-if="gameState === 'finished'">
        Result !
        <p>The winner is {{ winnerUsername }} !</p>
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
