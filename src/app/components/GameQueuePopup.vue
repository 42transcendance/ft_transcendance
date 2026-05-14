<script setup lang="ts">
const { gameQueueState, launchingTimer, cancelQueue } = useGameQueue()
const route = useRoute()

// Chronomètre d'attente (temps écoulé depuis que l'user cherche)
const waitSeconds = ref(0)
let waitInterval: ReturnType<typeof setInterval> | null = null

watch(gameQueueState, (state) => {
    if (state === 'waiting') {
        waitSeconds.value = 0
        waitInterval = setInterval(() => waitSeconds.value++, 1000)
    } else {
        clearInterval(waitInterval ?? undefined)
        waitInterval = null
        if (state === 'idle')
			waitSeconds.value = 0
    }
}, { immediate: true })

onUnmounted(() => clearInterval(waitInterval ?? undefined))

const waitFormatted = computed(() => {
    const m = String(Math.floor(waitSeconds.value / 60)).padStart(2, '0')
    const s = String(waitSeconds.value % 60).padStart(2, '0')
    return `${m}:${s}`
})

const visible = computed(() => {
    const isGamePage = route.path === '/game'
    const isPlaying = gameQueueState.value === 'playing'
    
    // Masquer le popup si on est sur la page game et qu'une partie est en cours
    if (isGamePage && isPlaying) return false
    
    return ['waiting', 'starting', 'playing'].includes(gameQueueState.value)
})
</script>

<template>
    <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="translate-y-4 opacity-0"
    >
        <div
            v-if="visible"
            class="fixed bottom-5 left-5 z-[2500] w-72 rounded-2xl bg-white shadow-xl border border-gray-100 p-4 flex flex-col gap-3"
        >
            <!-- Waiting -->
            <template v-if="gameQueueState === 'waiting'">
                <div class="flex items-center justify-between">
                    <span class="font-semibold text-blue-950">Game searching</span>
                    <span class="text-sm font-mono text-blue-950/90">{{ waitFormatted }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-blue-950/90">
                    <div class="w-2 h-2 rounded-full bg-yellow-500 outline outline-orange-400 shadow-md shadow-yellow-500 animate-pulse" />
                    Searching opponent...
                </div>
                <button
                    @click="cancelQueue"
                    class="bg-red-600 rounded-md mt-4 p-2 hover:bg-red-900 hover:cursor-pointer text-white">
                    Cancel
                </button>
            </template>

            <!-- Starting -->
            <template v-else-if="gameQueueState === 'starting'">
                <div class="flex items-center justify-between">
                    <span class="font-semibold text-gray-800">Opponent found !</span>
                    <span class="text-2xl font-mono font-bold text-blue-500">{{ launchingTimer }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-blue-950/90">
                    <div class="w-2 h-2 rounded-full bg-green-500 outline outline-green-400 shadow-md shadow-green-500 animate-pulse" />
                    Game is starting in...
                </div>
                <NuxtLink
                    to="/game"
                    class="bg-green-600 rounded-md mt-4 p-2 hover:bg-green-900 hover:cursor-pointer text-center text-white"
                >
                    Go to game
                </NuxtLink>
            </template>

            <!-- Playing -->
            <template v-else-if="gameQueueState === 'playing'">
                <div class="flex items-center gap-2">
                    <span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span class="font-semibold text-gray-800">Game in progress</span>
                </div>
                <NuxtLink
                    to="/game"
                    class="text-center text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors rounded-xl py-2"
                >
                    Go to the game →
                </NuxtLink>
            </template>
        </div>
    </Transition>
</template>
