<script setup lang="ts">
useHead({ title: 'Game' })

import { fillBackground, render } from '~/game/render'
import { CANVAS } from '~shared/game/constants'

definePageMeta({ middleware: 'auth' })

<<<<<<< Updated upstream
const { send, whenReady, pendingGameMessage, isConnected } = useSocket()
const { gameQueueState, launchingTimer, gameTimerFormatted, resetToIdle, winner, painted, clicked, winnerUsername, requestSync } = useGameQueue()
=======
const { send, isConnected, pendingGameMessage } = useSocket()
const { gameQueueState, launchingTimer, gameTimerFormatted, resetToIdle, winner, win_color, painted, clicked } = useGameQueue()
>>>>>>> Stashed changes

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
        if (state.gameState === 'playing' || state.gameState === 'finished' || state.gameState === 'finished_eq') {
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

<<<<<<< Updated upstream
    if (ctx)
		render(ctx, state)
=======
    if (state.type === 'finished') {
        winner.value = state.winner
		win_color.value = state.win_color;
    }

    if (state.type === 'stats') {
        painted.value = state.painted
        clicked.value = state.clicked
    }

    if (ctx) render(ctx, state)
>>>>>>> Stashed changes
})

watch(gameState, async (newState) => {
    if (newState === 'playing') {
        await nextTick()
        ctx = canvas.value!.getContext('2d')!
        fillBackground(ctx)
        send({ type: 'ready' })
    }
    if (newState === 'finished_eq' || newState === 'finished' || newState === 'idle') {
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
<<<<<<< Updated upstream
    <div v-else-if="gameState === 'finished'">
        Result !
        <p>The winner is {{ winnerUsername }} !</p>
=======
    <div v-if="gameState === 'finished' || gameState ==='finished_eq'">
        Result !
        <p v-if="gameState === 'finished'">The winner is {{ win_color }} !</p>
        <p v-else>This game is a tie !</p>
>>>>>>> Stashed changes
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
