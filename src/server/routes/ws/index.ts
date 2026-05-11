import jwt from 'jsonwebtoken'
import { connectedPeers } from '../../utils/peers'
import { Room } from '../../game/room'
import { GAME, TIMER } from '~shared/game/constants'
import { ServerMessage, ClientMessage } from '~shared/game/type'

const secret = process.env.NUXT_JWT_SECRET
if (!secret)
    throw new Error('NUXT_JWT_SECRET is not defined')

const rooms: Room[] = []
const peerRoom = new Map<string, Room>()

// Parsing des cookies — extrait en utilitaire pour éviter la duplication
function parseCookies(header: string): Record<string, string> {
    return Object.fromEntries(
        header.split(';').map(c => {
            const [key, ...v] = c.trim().split('=')
            return [key, v.join('=')]
        })
    )
}

export default defineWebSocketHandler({
    async open(peer) {
        const cookieHeader = peer.request?.headers.get('cookie')
        if (!cookieHeader) {
            peer.close(1008, 'Unauthorized')
            return
        }

        const token = parseCookies(cookieHeader)['auth_token']
        if (!token) {
            peer.close(1008, 'Unauthorized')
            return
        }

        try {
            const decoded = jwt.verify(token, secret) as { userId: string }
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, username: true }
            })
            if (!user) {
                peer.close(1008, 'Unauthorized')
                return
            }

            // Stocke les infos communes
            peer.ctx = { userId: user.id, username: user.username }

            // ---- Logique global (statut online) ----
            connectedPeers.set(user.id, peer)
            peer.subscribe('status')
            peer.subscribe(`user:${user.id}`)
            await prisma.user.update({
                where: { id: user.id },
                data: { isOnline: { increment: 1 } }
            })
            peer.publish('status', JSON.stringify({
                type: 'STATUS_CHANGE',
                userId: user.id,
                isOnline: true
            }))

            // ---- Logique chat ----
            connectedPeers.set(`chat:${user.id}`, peer)
            peer.subscribe('chat')

            // ---- Logique jeu ----
            // Le joueur rejoint une room seulement s'il envoie un message 'join_game'
            // On ne le met pas dans une room automatiquement à la connexion

            console.log(`✅ User ${user.username} connected`)
        } catch (e) {
            peer.close(1008, 'Unauthorized')
        }
    },

    async message(peer, message) {
        if (!peer.ctx?.userId)
			return

        let data: any
        try {
            data = JSON.parse(message.text())
        } catch {
            return
        }

        // ---- Route vers le bon handler selon le type ----

        // Chat
        if (data.type === 'message') {
            if (!data.content || data.content.trim().length === 0)
				return
            if (data.content.length > 500)
				return

            try {
				const user = await prisma.user.findUnique({
					where: { id: peer.ctx.userId },
					select: { username: true }
				})
                const newMessage = await prisma.globalMessage.create({
                    data: {
                        content: data.content.trim(),
                        senderId: peer.ctx.userId,
                        senderUsername: user?.username || peer.ctx.username
                    }
                })
                const broadcast = JSON.stringify({
                    type: 'message',
                    data: {
                        id: newMessage.id,
                        content: newMessage.content,
                        username: user?.username || peer.ctx.username,
                        senderId: peer.ctx.userId,
                        createdAt: newMessage.createdAt
                    }
                })
                peer.publish('chat', broadcast)
                peer.send(broadcast)
            } catch (e) {
                console.error('Chat error:', e)
            }
            return
        }

        // Jeu — rejoindre une room
        if (data.type === 'join_game') {
            let currRoom = rooms.find(r => r.states === 'waiting')
            if (!currRoom) {
                currRoom = new Room(GAME.PLAYERS)
                rooms.push(currRoom)
            }
            currRoom.add_player(peer)
			peerRoom.set(peer.ctx.userId, currRoom)

            let server_msg: ServerMessage
            if (currRoom.currPlayer === GAME.PLAYERS) {
                server_msg = { type: 'starting' }
                currRoom.broadcast(server_msg)
                currRoom.start_game()
            } else {
                server_msg = { type: 'waiting' }
            }
            peer.send(JSON.stringify(server_msg))
            return
        }

		if (data.type === 'leave_queue') {
			const currRoom = peerRoom.get(peer.ctx.userId)
			if (!currRoom || currRoom.states !== 'waiting')
				return

			currRoom.remove_player(peer)
			peerRoom.delete(peer.ctx.userId)

			const idx = rooms.indexOf(currRoom)
			if (idx !== -1 && currRoom.currPlayer === 0)
				rooms.splice(idx, 1)

			peer.send(JSON.stringify({ type: 'no_game' }))
			return
		}

        // Jeu — ready et paint
        if (data.type === 'ready' || data.type === 'paint') {
            const currRoom = peerRoom.get(peer.ctx.userId)
            const playerId = currRoom?.get_id(peer)
            if (!currRoom)
				return

            if (currRoom.game && data.type === 'ready') {
                const init_board: ServerMessage = {
                    type: 'cell_init',
                    cells: currRoom.game.board.grid.flat()
                }
                peer.send(JSON.stringify(init_board))
                return
            }

            if (data.type === 'paint') {
                if (!currRoom.game)
					return
                if (playerId < currRoom.maxPlayer && currRoom.game.state === 'on-going') {
                    const cell = currRoom.game.players[playerId].paint(currRoom.game.board, currRoom.game)

                    const broadcast: ServerMessage = {
						type: 'cell_update',
						cell: cell
					}

                    currRoom.broadcast(broadcast)
                    currRoom.game.actualize()
                    currRoom.end_game()
                }
            }
        }
		if (data.type === 'sync_game') {
			const currRoom = peerRoom.get(peer.ctx.userId)
			if (currRoom) {
				currRoom.playerPeers.set(peer.ctx.userId, peer);
				
				const response: any = {
					type: 'sync_state',
					gameState: currRoom.states,
				}

				 if (currRoom.states === 'starting' && currRoom.startedAt) {
					const elapsed = Math.floor((Date.now() - currRoom.startedAt) / 1000);
					response.launchingTimer = Math.max(0, TIMER.LAUNCHING - elapsed);
				}

				if (currRoom.states === 'playing' && currRoom.gameStartedAt) {
					const elapsed = Math.floor((Date.now() - currRoom.gameStartedAt) / 1000);
					response.gameTimer = Math.max(0, TIMER.GAME - elapsed);
				}

				if (currRoom.game) {
					response.cells = currRoom.game.board.grid.flat()
				}

				if (currRoom.game?.state === 'over') {
					response.winner = currRoom.game.get_winner()
				}

				peer.send(JSON.stringify(response))
			} else {
				peer.send(JSON.stringify({ type: 'no_game' }))
			}
			return
		}
    },

    async close(peer) {
        const userId = peer.ctx?.userId
        if (!userId)
			return

        // ---- Logique global ----
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { isOnline: { decrement: 1 }, lastSeenAt: new Date() }
            })
            const updatedUser = await prisma.user.findUnique({ where: { id: userId } })
            if (updatedUser?.isOnline === 0) {
                connectedPeers.delete(userId)
                peer.publish('status', JSON.stringify({
                    type: 'STATUS_CHANGE',
                    userId: userId,
                    isOnline: false,
                    lastSeenAt: new Date()
                }))
            }
        } catch (e: any) {
            if (e.code !== 'P2025')
                console.error('Prisma error on disconnect:', e)
        }

        // ---- Logique chat ----
        connectedPeers.delete(`chat:${userId}`)

        // ---- Logique jeu ----
        const currRoom = peerRoom.get(peer.ctx.userId)
        if (currRoom) {
			currRoom.playerPeers.delete(peer.ctx.userId)
        }

        console.log(`User ${userId} disconnected`)
    }
})
