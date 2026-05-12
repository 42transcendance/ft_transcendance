import { TIMER } from '~shared/game/constants'

const winner = ref<number | null>(
    import.meta.client ? Number(sessionStorage.getItem('winner')) || null : null
)
const painted = ref<number | null>(
    import.meta.client ? Number(sessionStorage.getItem('painted')) || null : null
)
const clicked = ref<number | null>(
    import.meta.client ? Number(sessionStorage.getItem('clicked')) || null : null
)

function setWinner(value: number | null) {
    winner.value = value
    if (import.meta.client)
        value !== null ? sessionStorage.setItem('winner', String(value)) : sessionStorage.removeItem('winner')
}
function setPainted(value: number | null) {
    painted.value = value
    if (import.meta.client)
        value !== null ? sessionStorage.setItem('painted', String(value)) : sessionStorage.removeItem('painted')
}
function setClicked(value: number | null) {
    clicked.value = value
    if (import.meta.client)
        value !== null ? sessionStorage.setItem('clicked', String(value)) : sessionStorage.removeItem('clicked')
}

const gameQueueState = ref<'idle' | 'waiting' | 'starting' | 'playing' | 'finished'>('idle')
const launchingTimer = ref(TIMER.LAUNCHING)
const gameTimer = ref(TIMER.GAME)

let startingInterval: ReturnType<typeof setInterval> | null = null
let gamingInterval: ReturnType<typeof setInterval> | null = null


export const useGameQueue = () => {
    const { send, pendingGameMessage } = useSocket()

    watch(pendingGameMessage, (state) => {
        if (!state) return

        if (state.type === 'no_game') {
            gameQueueState.value = 'idle'
            return
        }
        if (state.type === 'sync_state') {
            if (state.gameState === 'starting' && state.launchingTimer !== undefined)
                launchingTimer.value = state.launchingTimer
            if (state.gameState === 'playing' && state.gameTimer !== undefined)
                gameTimer.value = state.gameTimer
            if (state.winner !== undefined) setWinner(state.winner)
            if (state.painted !== undefined) setPainted(state.painted)
            if (state.clicked !== undefined) setClicked(state.clicked)
            gameQueueState.value = state.gameState
            return
        }
        if (state.type === 'waiting')  gameQueueState.value = 'waiting'
        if (state.type === 'starting') gameQueueState.value = 'starting'
        if (state.type === 'playing')  gameQueueState.value = 'playing'
        if (state.type === 'finished') {
            setWinner(state.winner)
            if (state.painted !== undefined) setPainted(state.painted)
            if (state.clicked !== undefined) setClicked(state.clicked)
            gameQueueState.value = 'finished'
        }
        if (state.type === 'error') {
            console.warn('Game error:', state.message)
        }
    })

    watch(gameQueueState, (newState) => {
        // ← plus de sessionStorage ici
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
        if (newState === 'finished') {
            clearInterval(gamingInterval ?? undefined)
            gamingInterval = null
        }
        if (newState === 'idle') {
            clearInterval(startingInterval ?? undefined)
            clearInterval(gamingInterval ?? undefined)
            startingInterval = null
            gamingInterval = null
            gameTimer.value = TIMER.GAME
            launchingTimer.value = TIMER.LAUNCHING
        }
    })

    function resetToIdle() {
        send({ type: 'leave_game' })
        gameQueueState.value = 'idle'
        setWinner(null)
        setPainted(null)
        setClicked(null)
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
