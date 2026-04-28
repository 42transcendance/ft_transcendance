import { Game } from '../../../game/game'
import { GAME } from '../../../game/constants'

// État partagé entre toutes les connexions
const game = new Game(GAME.PLAYERS)
game.init_game()
let nextId = 0
const playerMap = new Map<string, number>()

export default defineWebSocketHandler({
  open(peer) {
    // Refuser si déjà 2 joueurs connectés
    if (playerMap.size >= GAME.PLAYERS) {
      peer.send(JSON.stringify({ type: 'error', message: 'Partie pleine' }))
      peer.close()
      return
    }
    const playerId = nextId % GAME.PLAYERS  // ← reste toujours entre 0 et 1
    nextId++
    playerMap.set(peer.id, playerId)
    peer.subscribe('game')
    // Même logique que son server.ts
    const message = {
      type: 'cell_init',
      cells: game.board.grid.flat()
    }
    peer.send(JSON.stringify(message))
  },

  message(peer, message) {
    const data = JSON.parse(message.text())
    const playerId = playerMap.get(peer.id) ?? 0 // à améliorer plus tard -> recupere le vrai player id

    if (data.type === 'paint') {
      if (playerId < GAME.PLAYERS && game.p_painted_cell[playerId].length !== 0) {
        const cell = game.players[playerId].paint(game.board, game)
        
        const broadcast = {
          type: 'cell_update',
          cell: cell
        }
        // Broadcast à tous
        peer.publish('game', JSON.stringify(broadcast))
        peer.send(JSON.stringify(broadcast))
      }
      game.actualize()
    }
  },

  close(peer) {
    playerMap.delete(peer.id)  // ← nettoie quand le joueur se déconnecte
    console.log('Joueur déconnecté')
  }
})