import { Game } from '../../../game/game'
import { GAME } from '../../../game/constants'

// État partagé entre toutes les connexions
const game = new Game(GAME.PLAYERS)
game.init_game()
let nextId = 0

export default defineWebSocketHandler({
  open(peer) {
    const playerId = nextId++
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
    const playerId = 0 // à améliorer plus tard

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
    console.log('Joueur déconnecté')
  }
})