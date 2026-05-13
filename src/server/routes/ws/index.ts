import jwt from 'jsonwebtoken'
import { addPeer, removePeer, getPeers, hasConnectedPeers, sendToUser, connectedPeers } from '../../utils/peers'
import { Room } from '../../game/room'
import { GAME, TIMER } from '~shared/game/constants'
import { ServerMessage } from '~shared/game/type'
import { rooms, peerRoom } from '../../utils/gameState'

const secret = process.env.NUXT_JWT_SECRET
if (!secret) throw new Error('NUXT_JWT_SECRET is not defined')

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
        if (!cookieHeader) { peer.close(1008, 'Unauthorized'); return }

        const token = parseCookies(cookieHeader)['auth_token']
        if (!token) { peer.close(1008, 'Unauthorized'); return }

        try {
            const decoded = jwt.verify(token, secret) as { userId: string }
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, username: true }
            })
            if (!user) { peer.close(1008, 'Unauthorized'); return }

            peer.ctx = { userId: user.id, username: user.username }

            // ---- Global ----
            // Ajoute ce peer sans écraser les autres onglets
            addPeer(user.id, peer)
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

            // ---- Chat ----
            peer.subscribe('chat')

            console.log(`✅ User ${user.username} connected (${getPeers(user.id).length} onglet(s))`)
        } catch (e) {
            peer.close(1008, 'Unauthorized')
        }
    },

    async message(peer, message) {
        if (!peer.ctx?.userId) return
        const userId = peer.ctx.userId

        let data: any
        try { data = JSON.parse(message.text()) } catch { return }

        // Chat — inchangé
        if (data.type === 'message') {
            if (!data.content || data.content.trim().length === 0) return
            if (data.content.length > 500) return
            try {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { username: true }
                })
                const newMessage = await prisma.globalMessage.create({
                    data: {
                        content: data.content.trim(),
                        senderId: userId,
                        senderUsername: user?.username || peer.ctx.username
                    }
                })
                const broadcast = JSON.stringify({
                    type: 'message',
                    data: {
                        id: newMessage.id,
                        content: newMessage.content,
                        username: user?.username || peer.ctx.username,
                        senderId: userId,
                        createdAt: newMessage.createdAt
                    }
                })
                peer.publish('chat', broadcast)
                peer.send(broadcast)
            } catch (e) { console.error('Chat error:', e) }
            return
        }

        // Jeu — rejoindre
        if (data.type === 'join_game') {
            const existingRoom = peerRoom.get(userId)
            if (existingRoom) {
                // Déjà en jeu — on sync tous les onglets
                sendToUser(userId, { type: existingRoom.states })
                return
            }
            let currRoom = rooms.find(r => r.states === 'waiting')
            if (!currRoom) {
                currRoom = new Room(GAME.PLAYERS)
                rooms.push(currRoom)
            }
            currRoom.add_player(peer)
            peerRoom.set(userId, currRoom)

            if (currRoom.currPlayer === GAME.PLAYERS) {
                currRoom.broadcast({ type: 'starting' })
                currRoom.start_game()
            } else {
                // Notifie tous les onglets du joueur
                sendToUser(userId, { type: 'waiting' })
            }
            return
        }

        // Quitter la file
        if (data.type === 'leave_queue') {
            const currRoom = peerRoom.get(userId)
            if (!currRoom || currRoom.states !== 'waiting') return
            currRoom.remove_player(userId)
            peerRoom.delete(userId)
            if (currRoom.currPlayer === 0) {
                const idx = rooms.indexOf(currRoom)
                if (idx !== -1) rooms.splice(idx, 1)
            }
            // Notifie tous les onglets
            sendToUser(userId, { type: 'no_game' })
            return
        }

        // Quitter après fin de partie
        if (data.type === 'leave_game') {
            const currRoom = peerRoom.get(userId)
            if (!currRoom || currRoom.states !== 'finished') return
            peerRoom.delete(userId)
            const anyoneLeft = currRoom.userIds.some(id => peerRoom.get(id) === currRoom)
            if (!anyoneLeft) {
                const idx = rooms.indexOf(currRoom)
                if (idx !== -1) rooms.splice(idx, 1)
            }
            sendToUser(userId, { type: 'no_game' })
            return
        }

        // Ready et paint
        if (data.type === 'ready' || data.type === 'paint') {
            const currRoom = peerRoom.get(userId)
            if (!currRoom) return
            const playerId = currRoom.get_id_by_userId(userId)

            if (data.type === 'ready') {
                if (!currRoom.game) return
                // Envoie le board à tous les onglets de ce joueur
                sendToUser(userId, {
                    type: 'cell_init',
                    cells: currRoom.game.board.grid.flat()
                })
                return
            }

            if (data.type === 'paint') {
                if (!currRoom.game) return
                if (playerId >= 0 && playerId < currRoom.maxPlayer && currRoom.game.state === 'on-going') {
                    const cell = currRoom.game.players[playerId].paint(currRoom.game.board, currRoom.game)
                    currRoom.broadcast({ type: 'cell_update', cell })
                    currRoom.game.actualize()
                    currRoom.end_game()
                }
            }
            return
        }

        // Sync au chargement/rechargement de page
        if (data.type === 'sync_game') {
            const currRoom = peerRoom.get(userId)
            if (!currRoom) {
                peer.send(JSON.stringify({ type: 'no_game' }))
                return
            }

            const response: any = {
                type: 'sync_state',
                gameState: currRoom.states,
            }

			if (currRoom.states === 'waiting' && currRoom.waitStartedAt) {
				response.waitStartedAt = currRoom.waitStartedAt
			}
            if (currRoom.states === 'starting' && currRoom.startedAt) {
                const elapsed = Math.floor((Date.now() - currRoom.startedAt) / 1000)
                response.launchingTimer = Math.max(0, TIMER.LAUNCHING - elapsed)
            }
            if (currRoom.states === 'playing' && currRoom.gameStartedAt) {
                const elapsed = Math.floor((Date.now() - currRoom.gameStartedAt) / 1000)
                response.gameTimer = Math.max(0, TIMER.GAME - elapsed)
            }
            if (currRoom.game) {
                response.cells = currRoom.game.board.grid.flat()
            }
            if (currRoom.states === 'finished' && currRoom.game) {
				const winner_id = currRoom.game.get_winner()
				response.winner = winner_id
				const winnerUserId = currRoom.userIds[winner_id]
				response.winnerUsername = currRoom.usernames.get(winnerUserId) ?? 'Unknown'
                const stats = currRoom.get_stats_by_userId(userId)
                response.painted = stats.painted
                response.clicked = stats.clicked
            }

            // Envoie uniquement à ce peer — les autres onglets ont leur propre sync
            peer.send(JSON.stringify(response))
            return
        }
    },

    async close(peer) {
        const userId = peer.ctx?.userId
        if (!userId)
			return

        // ---- Global ----
        try {
            removePeer(userId, peer)

            await prisma.user.update({
                where: { id: userId },
                data: { isOnline: { decrement: 1 }, lastSeenAt: new Date() }
            })
            // Passe offline seulement si plus aucun onglet connecté
            if (!hasConnectedPeers(userId)) {
                peer.publish('status', JSON.stringify({
                    type: 'STATUS_CHANGE',
                    userId,
                    isOnline: false,
                    lastSeenAt: new Date()
                }))
            }
        } catch (e: any) {
            if (e.code !== 'P2025') console.error('Prisma error on disconnect:', e)
        }

        console.log(`User ${userId} disconnected (${getPeers(userId).length} onglet(s) restant(s))`)
    }
})
