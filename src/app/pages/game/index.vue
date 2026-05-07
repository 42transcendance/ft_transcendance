<script setup lang="ts">
import { fillBackground, render } from '~/game/render'
import { GRID_INFO, TIMER } from '~shared/game/constants'

definePageMeta({ middleware: 'auth' })

const gameState = ref<"waiting" | "starting" | "playing" | "finished">("waiting");
const launchingTimer = ref(TIMER.LAUNCHING);
let starting: ReturnType<typeof setInterval> | null = null;

const gameTimer = ref(TIMER.GAME);
let gaming: ReturnType<typeof setInterval> | null = null;

const winner = ref<number | null>(null);
const painted = ref<number | null>(null);
const clicked = ref<number | null>(null);

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
	{
		gameState.value = "finished"
		winner.value = state.winner;
	}
	if (state.type === "stats")
	{
		painted.value = state.painted;
		clicked.value = state.clicked;
	}
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
		clearInterval(starting);
		starting = null;
		launchingTimer.value = TIMER.LAUNCHING;
	}
	if (newState === "starting")
		timer(starting, launchingTimer);
	if (newState === "playing")
	{
		await nextTick();
		timer(gaming, gameTimer);
		ctx = canvas.value!.getContext('2d')!

		fillBackground(ctx)
		ws?.send(JSON.stringify({ type: 'ready'}));
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
function timer(timer: any, seconds: any) {
	timer = setInterval(() => {
		seconds.value--;
		if (seconds.value <= 0) {
			clearInterval(timer);
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

</script>

<template>
  <div>
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
