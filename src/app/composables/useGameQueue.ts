import { TIMER } from '~shared/game/constants'

<<<<<<< Updated upstream
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
function setWinnerUsername(value: string | null) {
    winnerUsername.value = value
    if (import.meta.client)
        value !== null
            ? sessionStorage.setItem('winnerUsername', value)
            : sessionStorage.removeItem('winnerUsername')
}

const gameQueueState = ref<'syncing' | 'idle' | 'waiting' | 'starting' | 'playing' | 'finished'>(
    import.meta.client && sessionStorage.getItem('winner') !== null
        ? 'finished'
        : 'syncing'
)

=======
const winner = ref<number | null>(null)
const win_color = ref<string | null>(null)
const painted = ref<number | null>(null)
const clicked = ref<number | null>(null)

function getInitialState(): 'idle' | 'waiting' | 'starting' | 'playing' | 'finished' | 'finished_eq' {
    if (import.meta.client) {
        const saved = sessionStorage.getItem('gameState')
        if (saved && ['waiting', 'starting', 'playing', 'finished', 'finished_eq'].includes(saved))
            return saved as any
    }
    return 'idle'
}

const gameQueueState = ref<'idle' | 'waiting' | 'starting' | 'playing' | 'finished' | 'finished_eq'>(getInitialState())
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
				setWinner(state.winner)
            if (state.painted !== undefined)
				setPainted(state.painted)
            if (state.clicked !== undefined)
				setClicked(state.clicked)
			if (state.winnerUsername !== undefined)
				setWinnerUsername(state.winnerUsername)

=======
			if (state.winner !== undefined) {
				win_color.value = state.win_color
				winner.value = state.winner
			}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            clearAllIntervals()
            setWinner(state.winner)
			setWinnerUsername(state.winnerUsername ?? null)
            if (state.painted !== undefined)
				setPainted(state.painted)
            if (state.clicked !== undefined)
				setClicked(state.clicked)
            gameQueueState.value = 'finished'
        }
        if (state.type === 'error') {
            console.warn('Game error:', state.message)
        }
=======
			winner.value = state.winner
			win_color.value = state.win_color
			gameQueueState.value = 'finished'
		}
		if (state.type === 'finished_eq')
			gameQueueState.value = 'finished_eq'
		if (state.type === 'stats') {
			painted.value = state.painted
			clicked.value = state.clicked
		}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
		if (newState === 'finished' || newState === 'finished_eq') {
			clearInterval(gamingInterval ?? undefined)
			gamingInterval = null
		}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        winner,
		winnerUsername,
=======
		winner,
		win_color,
>>>>>>> Stashed changes
        painted,
        clicked,
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
