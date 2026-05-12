<script setup lang="ts">
const { gameQueueState, launchingTimer, cancelQueue, waitStartedAt } = useGameQueue()
// Chronomètre d'attente (temps écoulé depuis que l'user cherche)

const tick = ref(0)
let tickInterval: ReturnType<typeof setInterval> | null = null

const waitFormatted = computed(() => {
	tick.value
    if (!waitStartedAt.value)
		return '00:00'
    const elapsed = Math.floor((Date.now() - waitStartedAt.value) / 1000)
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0')
    const s = String(elapsed % 60).padStart(2, '0')
    return `${m}:${s}`
})

onMounted(() => {
    tickInterval = setInterval(() => tick.value++, 1000)
})

onUnmounted(() => {
    clearInterval(tickInterval ?? undefined)
})

const visible = computed(() =>
    ['waiting', 'starting', 'playing'].includes(gameQueueState.value)
)
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
                    <span class="font-semibold text-gray-800">Game searching</span>
                    <span class="text-sm font-mono text-gray-400">{{ waitFormatted }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span class="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    Searching opponent...
                </div>
                <button
                    @click="cancelQueue"
                    class="text-xs text-red-400 hover:text-red-600 transition-colors self-end"
                >
                    Cancel
                </button>
            </template>

            <!-- Starting -->
            <template v-else-if="gameQueueState === 'starting'">
                <div class="flex items-center justify-between">
                    <span class="font-semibold text-gray-800">Opponent found !</span>
                    <span class="text-2xl font-mono font-bold text-indigo-500">{{ launchingTimer }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span class="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Game is starting in...
                </div>
                <NuxtLink
                    to="/game"
                    class="mt-1 text-center text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors rounded-xl py-2"
                >
                    Go to the game →
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
