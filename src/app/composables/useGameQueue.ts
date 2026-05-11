import { TIMER } from '~shared/game/constants'

const winner = ref<number | null>(null)
const painted = ref<number | null>(null)
const clicked = ref<number | null>(null)

const gameQueueState = ref<'idle' | 'waiting' | 'starting' | 'playing' | 'finished'>('idle')
const launchingTimer = ref(TIMER.LAUNCHING)
const gameTimer = ref(TIMER.GAME)

let startingInterval: ReturnType<typeof setInterval> | null = null
let gamingInterval: ReturnType<typeof setInterval> | null = null

function startCountdown(timerRef: Ref<number>) {
    return setInterval(() => {
        timerRef.value--
        if (timerRef.value <= 0)
            clearInterval(startingInterval ?? gamingInterval ?? undefined)
    }, 1000)
}

export const useGameQueue = () => {
    const { send, pendingGameMessage } = useSocket()

    watch(pendingGameMessage, (state) => {
        if (!state)
			return

        if (state.type === 'no_game') {
            gameQueueState.value = 'idle'
            return
        }
        if (state.type === 'sync_state') {
            if (state.gameState === 'starting' && state.launchingTimer !== undefined)
                launchingTimer.value = state.launchingTimer
            if (state.gameState === 'playing' && state.gameTimer !== undefined)
                gameTimer.value = state.gameTimer
			if (state.winner !== undefined)
				winner.value = state.winner
            gameQueueState.value = state.gameState
            return
        }
        if (state.type === 'waiting')
			gameQueueState.value = 'waiting'
        if (state.type === 'starting')
			gameQueueState.value = 'starting'
        if (state.type === 'playing')
			gameQueueState.value = 'playing'
        if (state.type === 'finished') {
			winner.value = state.winner
			gameQueueState.value = 'finished'
		}
		if (state.type === 'stats') {
			painted.value = state.painted
			clicked.value = state.clicked
		}
    })

    watch(gameQueueState, (newState) => {
        if (newState === 'waiting') {
            clearInterval(startingInterval ?? undefined)
            startingInterval = null
            launchingTimer.value = TIMER.LAUNCHING
        }
        if (newState === 'starting' && !startingInterval) {
            startingInterval = setInterval(() => {
                launchingTimer.value--
                if (launchingTimer.value <= 0) {
                    clearInterval(startingInterval!)
                    startingInterval = null
                }
            }, 1000)
        }
        if (newState === 'playing' && !gamingInterval) {
            gamingInterval = setInterval(() => {
                gameTimer.value--
                if (gameTimer.value <= 0) {
                    clearInterval(gamingInterval!)
                    gamingInterval = null
                }
            }, 1000)
        }
        if (newState === 'idle') {
            clearInterval(startingInterval ?? undefined)
            clearInterval(gamingInterval ?? undefined)
            startingInterval = null
            gamingInterval = null
            gameTimer.value = TIMER.GAME
            launchingTimer.value = TIMER.LAUNCHING
        }
		if (newState === 'finished') {
			clearInterval(gamingInterval ?? undefined)
			gamingInterval = null
		}
    })

	function resetToIdle() {
		gameQueueState.value = 'idle'
		gameTimer.value = TIMER.GAME
		launchingTimer.value = TIMER.LAUNCHING
	}

    function cancelQueue() {
        send({ type: 'leave_queue' })
        gameQueueState.value = 'idle'
    }

    const gameTimerFormatted = computed(() => {
        const m = String(Math.floor(gameTimer.value / 60)).padStart(2, '0')
        const s = String(gameTimer.value % 60).padStart(2, '0')
        return `${m}:${s}`
    })

    return {
		winner,
        painted,
        clicked,
        gameQueueState,
        launchingTimer,
        gameTimer,
        gameTimerFormatted,
        cancelQueue,
		resetToIdle,
    }
}
