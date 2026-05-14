import { TIMER } from '~shared/game/constants'

const winner = ref<number | null>(
    import.meta.client
        ? (sessionStorage.getItem('winner') !== null
            ? Number(sessionStorage.getItem('winner'))
            : null)
        : null
)

const clicked = ref<number | null>(
    import.meta.client
        ? (sessionStorage.getItem('clicked') !== null
            ? Number(sessionStorage.getItem('clicked'))
            : null)
        : null
)
const painted = ref<number | null>(
    import.meta.client
        ? (sessionStorage.getItem('painted') !== null
            ? Number(sessionStorage.getItem('painted'))
            : null)
        : null
)

const is_eq = ref<boolean | null>(
	import.meta.client
		? (sessionStorage.getItem('is_eq') !== null
			? Boolean(sessionStorage.getItem('is_eq') === 'true')
			: null)
		: null
)

const winnerUsername = ref<string | null>(
    import.meta.client ? sessionStorage.getItem('winnerUsername') : null
)

function setWinner(value: number | null) {
    winner.value = value
    if (import.meta.client)
        value !== null
            ? sessionStorage.setItem('winner', String(value))
            : sessionStorage.removeItem('winner')
}
function setPainted(value: number | null) {
    painted.value = value
    if (import.meta.client)
        value !== null
            ? sessionStorage.setItem('painted', String(value))
            : sessionStorage.removeItem('painted')
}
function setClicked(value: number | null) {
    clicked.value = value
    if (import.meta.client)
        value !== null
            ? sessionStorage.setItem('clicked', String(value))
            : sessionStorage.removeItem('clicked')
}

function setIsEq(value: boolean | null) {
	is_eq.value = value
	if (import.meta.client)
		value !== null
			? sessionStorage.setItem('is_eq', String(value))
			: sessionStorage.removeItem('is_eq')
}

function setWinnerUsername(value: string | null) {
    winnerUsername.value = value
    if (import.meta.client)
        value !== null
            ? sessionStorage.setItem('winnerUsername', value)
            : sessionStorage.removeItem('winnerUsername')
}

const gameQueueState = ref<'syncing' | 'idle' | 'waiting' | 'starting' | 'playing' | 'finished'>(
    import.meta.client && sessionStorage.getItem('winner') !== null
        ? 'idle'
        : 'syncing'
)

const launchingTimer = ref(TIMER.LAUNCHING)
const gameTimer = ref(TIMER.GAME)

let startingInterval: ReturnType<typeof setInterval> | null = null
let gamingInterval: ReturnType<typeof setInterval> | null = null

const waitStartedAt = ref<number | null>(
    import.meta.client
        ? (sessionStorage.getItem('waitStartedAt')
            ? Number(sessionStorage.getItem('waitStartedAt'))
            : null)
        : null
)

function setWaitStartedAt(value: number | null) {
    waitStartedAt.value = value
    if (import.meta.client)
        value !== null
            ? sessionStorage.setItem('waitStartedAt', String(value))
            : sessionStorage.removeItem('waitStartedAt')
}

function clearAllIntervals() {
    clearInterval(startingInterval ?? undefined)
    clearInterval(gamingInterval ?? undefined)
    startingInterval = null
    gamingInterval = null
}

export function clearGameStorage() {
	if (!import.meta.client)
		return
	sessionStorage.removeItem('winner')
	sessionStorage.removeItem('winnerUsername')
	sessionStorage.removeItem('painted')
	sessionStorage.removeItem('clicked')
	sessionStorage.removeItem('waitStartedAt')
	winner.value = null
	winnerUsername.value = null
	painted.value = null
	clicked.value = null
	gameQueueState.value = 'syncing'
	launchingTimer.value = TIMER.LAUNCHING
	gameTimer.value = TIMER.GAME
	clearAllIntervals()
}

export const useGameQueue = () => {
    const { send, whenReady, pendingGameMessage } = useSocket()

	function requestSync() {
        pendingGameMessage.value = null
        whenReady(() => {
			send({ type: 'sync_game' })
		})
    }

    watch(pendingGameMessage, (state) => {
        if (!state)
			return

        if (state.type === 'no_game') {
            clearAllIntervals()
			if (gameQueueState.value !== 'finished')
				gameQueueState.value = 'idle'
            return
        }

        if (state.type === 'sync_state') {
            clearAllIntervals()

			if (state.gameState === 'waiting' && state.waitStartedAt !== undefined) {
				setWaitStartedAt(state.waitStartedAt)
			}

            if (state.gameState === 'starting' && state.launchingTimer !== undefined) {
                launchingTimer.value = state.launchingTimer
                if (state.launchingTimer > 0) {
                    startingInterval = setInterval(() => {
                        launchingTimer.value--
                        if (launchingTimer.value <= 0) {
                            clearInterval(startingInterval!)
                            startingInterval = null
                        }
                    }, 1000)
                }
            }

            if (state.gameState === 'playing' && state.gameTimer !== undefined) {
                gameTimer.value = state.gameTimer
                if (state.gameTimer > 0) {
                    gamingInterval = setInterval(() => {
                        gameTimer.value--
                        if (gameTimer.value <= 0) {
                            clearInterval(gamingInterval!)
                            gamingInterval = null
                        }
                    }, 1000)
                }
            }

            if (state.winner !== undefined)
				setWinner(state.winner);
            if (state.painted !== undefined)
				setPainted(state.painted);
            if (state.clicked !== undefined)
				setClicked(state.clicked);
			if (state.winnerUsername !== undefined)
				setWinnerUsername(state.winnerUsername);
			if (state.is_eq !== undefined)
				setIsEq(state.is_eq);

            gameQueueState.value = state.gameState
            return
        }

        if (state.type === 'waiting') {
            clearAllIntervals()
            launchingTimer.value = TIMER.LAUNCHING
			setWaitStartedAt(Date.now())
            gameQueueState.value = 'waiting'
        }
        if (state.type === 'starting') {
            clearAllIntervals()
            launchingTimer.value = TIMER.LAUNCHING
            gameQueueState.value = 'starting'
        }
        if (state.type === 'playing') {
            clearAllIntervals()
            gameTimer.value = TIMER.GAME
            gameQueueState.value = 'playing'
        }
        if (state.type === 'finished') {
            clearAllIntervals()
            setWinner(state.winner)
			setWinnerUsername(state.winnerUsername ?? null)
            if (state.painted !== undefined)
				setPainted(state.painted);
            if (state.clicked !== undefined)
				setClicked(state.clicked);
			if (state.is_eq !== undefined)
				setIsEq(state.is_eq);
            gameQueueState.value = 'finished'
        }
        if (state.type === 'error') {
            console.warn('Game error:', state.message)
        }
    })

    watch(gameQueueState, (newState) => {
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
            clearAllIntervals()
            gameTimer.value = TIMER.GAME
            launchingTimer.value = TIMER.LAUNCHING
        }
    })

    function resetToIdle() {
        send({ type: 'leave_game' })
        clearAllIntervals()
		setWaitStartedAt(null)
        gameQueueState.value = 'idle'
        setWinner(null)
		setWinnerUsername(null)
        setPainted(null)
        setClicked(null)
        gameTimer.value = TIMER.GAME
        launchingTimer.value = TIMER.LAUNCHING
    }

    function cancelQueue() {
        send({ type: 'leave_queue' })
        clearAllIntervals()
		setWaitStartedAt(null)
        gameQueueState.value = 'idle'
    }

    const gameTimerFormatted = computed(() => {
        const m = String(Math.floor(gameTimer.value / 60)).padStart(2, '0')
        const s = String(gameTimer.value % 60).padStart(2, '0')
        return `${m}:${s}`
    })

    return {
        winner,
		winnerUsername,
        painted,
        clicked,
		is_eq,
        gameQueueState,
        launchingTimer,
        gameTimer,
        gameTimerFormatted,
        cancelQueue,
        resetToIdle,
		waitStartedAt,
		requestSync,
    }
}
