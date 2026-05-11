<script setup lang="ts">
useHead({
	title: 'Game'
})

import { fillBackground, render } from '~/game/render'
import { GRID_INFO, TIMER } from '~shared/game/constants'

definePageMeta({ middleware: 'auth' })

const { send, isConnected, pendingGameMessage } = useSocket()


const gameState = ref<"join_game" | "waiting" | "starting" | "playing" | "finished">("join_game");
const launchingTimer = ref(TIMER.LAUNCHING);
let starting: ReturnType<typeof setInterval> | null = null;

const gameTimer = ref(TIMER.GAME);
let gaming: ReturnType<typeof setInterval> | null = null;

const winner = ref<number | null>(null);
const painted = ref<number | null>(null);
const clicked = ref<number | null>(null);

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null;

onMounted(() => {
    if (isConnected.value) {
        send({ type: 'sync_game' });
    }
});

watch(isConnected, (connected) => {
    if (connected) {
        send({ type: 'sync_game' })
    }
})

watch(pendingGameMessage, async (state) => {
    if (!state)
		return

	if (state.type === 'no_game') {
        gameState.value = 'join_game'
        return
    }

    if (state.type === 'sync_state') {
		if (state.gameState === 'starting' && state.launchingTimer !== undefined)
			launchingTimer.value = state.launchingTimer
		if (state.gameState === 'playing' && state.gameTimer !== undefined)
			gameTimer.value = state.gameTimer

		gameState.value = state.gameState

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


    if (state.type === "join_game")
		gameState.value = "join_game"
    if (state.type === "waiting")
		gameState.value = "waiting"
    if (state.type === "starting")
		gameState.value = "starting"
    if (state.type === "playing")
		gameState.value = "playing"
    if (state.type === "finished") {
        gameState.value = "finished"
        winner.value = state.winner
    }
    if (state.type === "stats") {
        painted.value = state.painted
        clicked.value = state.clicked
    }
    if (ctx)
		render(ctx, state)
})

/**
 * Réagit aux changements d'état du jeu pour gérer les effets de bord :
 * timer, initialisation du canvas, signal "ready" au serveur, etc.
 */
watch(gameState, async (newState) => {
	if (newState === "waiting") {
		clearInterval(starting);
		starting = null;
		launchingTimer.value = TIMER.LAUNCHING;
	}
	if (newState === "starting") {
		if (!starting)
			starting = timer(starting, launchingTimer);
	}
	if (newState === "playing")
	{
		await nextTick();
		if (!gaming)
			gaming = timer(gaming, gameTimer);
		ctx = canvas.value!.getContext('2d')!

		fillBackground(ctx)
		send({ type: 'ready' })
	}
	if (newState === "finished") {
		ctx = null;

		clearInterval(gaming);
		gaming = null;
		gameTimer.value = TIMER.GAME;
		await nextTick();
	}
})

/**
 * Lance un compte à rebours en secondes affiché à l'écran.
 */
function timer(refTimer: any, seconds: any) {
	return setInterval(() => {
		seconds.value--;
		if (seconds.value <= 0) {
			clearInterval(refTimer);
		}
	}, 1000);
}


/**
 * Envoie une action de peinture au serveur.
 * Le serveur déterminera quelle case sera effectivement peinte.
 */
const paint = () => {
	send({ type: 'paint' })
}

/**
 * Temps formatte pour l'affichage xx:xx
 * ATTENTION: Ne fonctionne qu'avec 'gameTimer' mais il existe
 * un moyen de le faire en dynamique !
 */
const seconds = computed(() => {
	return String(gameTimer.value % 60).padStart(2, '0')
})

const minutes = computed(() => {
	return String(Math.floor(gameTimer.value / 60)).padStart(2, '0')
})

function handleFindMatch() {
	send({ type: 'join_game' })
}

</script>

<template>
  <div>
	<div v-if="gameState === 'join_game'">
		<button @click="handleFindMatch">Find a match !</button>
	</div>
	<div v-if="gameState === 'waiting'">
		En attente d'un autre joueur...
	</div>

	<div v-if="gameState === 'starting'">
		<p>Le jeu se lance dans {{ launchingTimer }} secondes!</p>
	</div>

	<div v-if="gameState === 'playing'">
		<canvas
		ref="canvas"
		:width="GRID_INFO.WIDTH * 2"
		:height="GRID_INFO.HEIGHT * 2"
		/>
		<button @click="paint">Paint</button>
		<p> {{ minutes }} : {{ seconds }} </p>
	</div>
	<div v-if="gameState === 'finished'">
		Jeu Termine !
		<p>
		Le gagnant est le joueur {{ winner }} !
		</p>
		Stats:
		<p>
		Nombre de cases peintes : {{ painted }}
		<p>
		</p>
		Nombre de cliques : {{ clicked }}
		</p>
		<NuxtLink to="/">Retour au menu</NuxtLink>
	</div>
  </div>
</template>
