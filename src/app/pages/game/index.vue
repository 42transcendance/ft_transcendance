<script setup lang="ts">
import { fillBackground, render } from '~/game/render'
import { GRID_INFO } from '~/game/constants'

definePageMeta({ middleware: 'auth' })

const gameState = ref<"waiting" | "starting" | "playing" | "finished">("waiting");
const gameTimer = ref(10);
let starting: ReturnType<typeof setTimeout> | null = null;

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null;
let ws: WebSocket | null = null

/**
 * Établit la connexion WebSocket au montage du composant.
 * Met en place l'écouteur de messages qui pilote les transitions d'état
 * et délègue le rendu graphique à la fonction `render`.
 */
onMounted(() => {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${protocol}//${location.host}/ws/game/1`)
  ws.addEventListener("message", (event) => {
    const state = JSON.parse(event.data)

	if (state.type === "waiting")
		gameState.value = "waiting"
	if (state.type === "starting")
		gameState.value = "starting"
	if (state.type === "playing")
		gameState.value = "playing"
	if (state.type === "finished")
		gameState.value = "finished"
	if (ctx)
		render(ctx, state);
  })
})

/**
 * Réagit aux changements d'état du jeu pour gérer les effets de bord :
 * timer, initialisation du canvas, signal "ready" au serveur, etc.
 */
watch(gameState, async (newState) => {
	if (newState === "waiting") {
		clearTimeout(starting);
		starting = null;
		gameTimer.value = 10;
	}
	if (newState === "starting")
		start_timer();
	if (newState === "playing")
	{
		await nextTick();
		ctx = canvas.value!.getContext('2d')!

		fillBackground(ctx)
		ws?.send(JSON.stringify({ type: 'ready'}));
	}
	if (newState === "finished") {
		ctx = null;
		await nextTick();
	}
})

/**
 * Lance le compte à rebours de 10 secondes affiché à l'écran.
 * Décrémente `gameTimer` chaque seconde et s'arrête à 0.
 */
function start_timer() {
	starting = setInterval(() => {
		gameTimer.value--;
		if (gameTimer.value <= 0) {
			clearInterval(starting);
		}
	}, 1000);
}
/** Ferme proprement la connexion WebSocket à la destruction du composant */
onUnmounted(() => ws?.close())

/**
 * Envoie une action de peinture au serveur.
 * Le serveur déterminera quelle case sera effectivement peinte.
 */
const paint = () => {
  ws?.send(JSON.stringify({ type: 'paint' }))
}
</script>

<template>
  <div>
	<div v-if="gameState === 'waiting'">
		En attente d'un autre joueur...
	</div>

	<div v-if="gameState === 'starting'">
		<p>Le jeu se lance dans {{ gameTimer }} secondes!</p>
	</div>

	<div v-if="gameState === 'playing'">
		<canvas
		ref="canvas"
		:width="GRID_INFO.WIDTH * 2"
		:height="GRID_INFO.HEIGHT * 2"
		/>
		<button @click="paint">Paint</button>
	</div>
	<div v-if="gameState === 'finished'">
		Jeu Termine ! Envie de refaire une partie ?
	</div>
  </div>
</template>

