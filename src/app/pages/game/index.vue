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

watch(isConnected, (connected) => {
    if (connected)
        send({ type: 'sync_game' })
}, { immediate: true })

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

    if (state.type === 'finished') {
        winner.value = state.winner
    }
    if (state.type === 'stats') {
        painted.value = state.painted
        clicked.value = state.clicked
    }

    if (ctx) render(ctx, state)
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
    <div v-if="gameState === 'waiting'">
        Waiting for an opponent...
    </div>
    <div v-if="gameState === 'starting'">
        <p>The game is starting in {{ launchingTimer }} seconds!</p>
    </div>
    <div v-if="gameState === 'playing'">
        <canvas
            ref="canvas"
            :width="GRID_INFO.WIDTH * 2"
            :height="GRID_INFO.HEIGHT * 2"
        />
        <button @click="paint">Paint</button>
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
