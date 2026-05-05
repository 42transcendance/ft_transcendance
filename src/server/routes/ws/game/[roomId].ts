import { Room } from '../../../game/room'
import { GAME } from '../../../game/constants'
import { ServerMessage, ClientMessage } from '../../../game/type'

// État partagé entre toutes les connexions
const rooms: Room[] =[];
const peerRoom = new Map<string, Room>()

/**
 * Handler WebSocket principal du jeu Pixel Fight.
 * Gère le matchmaking, les actions de jeu et les déconnexions.
 */
export default defineWebSocketHandler({

	/**
     * Gère la connexion d'un nouveau joueur.
     * Cherche une room en attente ou en crée une nouvelle, ajoute le joueur,
     * puis lui envoie son état (waiting ou starting).
     * Si la room est complète, lance le compte à rebours de démarrage.
     *
     * @param peer - Socket WebSocket du joueur qui se connecte
     */
	open(peer) {
	
    	console.log('Joueur connecté')
		var currRoom = rooms.find(r => r.states === "waiting");

		if (currRoom === undefined) {
			currRoom = new Room(GAME.PLAYERS);
			rooms.push(currRoom)
		}
		currRoom.add_player(peer);
		peerRoom.set(peer.id,currRoom);

		let server_msg: ServerMessage;
		if (currRoom.currPlayer === GAME.PLAYERS) {
			server_msg = {
				type: "starting"
			}
			currRoom.broadcast(server_msg);
			currRoom.start_game();
		} else {
			server_msg = {
				type: "waiting",
			}
		}
		peer.send(JSON.stringify(server_msg));
	},

    /**
     * Gère les messages reçus d'un joueur.
     * Deux types de messages sont supportés :
     * - "ready" : le client est prêt à recevoir l'état initial du plateau
     * - "paint" : le joueur veut peindre une case adjacente à sa zone
     *
     * @param peer - Socket du joueur qui envoie le message
     * @param message - Message brut reçu du client
     */
	message(peer, message) {
		const data: ClientMessage = JSON.parse(message.text())
		const currRoom = peerRoom.get(peer.id);
		const playerId = currRoom?.get_id(peer);

		if (!currRoom) {
			return;
		}
		// Le client signale qu'il est prêt → on lui envoie l'état initial du plateau
		if (currRoom.game && data.type === 'ready') {
			const init_board: ServerMessage = {
				type: 'cell_init',
				cells: currRoom.game.board.grid.flat()
			};
			peer.send(JSON.stringify(init_board));
		}
        // Le client veut peindre une case
		if (data.type === 'paint') {

			if (!currRoom.game) {
				return ;
			}
			if (playerId < currRoom.maxPlayer && currRoom.game.state === "on-going") {
				const cell = currRoom.game.players[playerId].paint(currRoom.game.board, currRoom.game);

				const broadcast: ServerMessage = {
					type: 'cell_update',
					cell: cell
				}
				// Broadcast à tous
				currRoom.broadcast(broadcast);
				currRoom.game.actualize();
				currRoom.end_game();
			}
		}
	},

    /**
     * Gère la déconnexion d'un joueur.
     * Retire le joueur de sa room. Si la room est vide, la supprime du serveur.
     * Sinon, met à jour l'état du jeu (peut déclencher la fin de partie).
     *
     * @param peer - Socket du joueur qui se déconnecte
     */
	close(peer) {
    	const currRoom = peerRoom.get(peer.id);
		currRoom?.remove_player(peer);

		if (currRoom?.currPlayer === 0) {
			const index = rooms.indexOf(currRoom);
			rooms.splice(index, 1)
		}
		else {
			if (currRoom.game) {
				currRoom.game.actualize();
				currRoom.end_game();
			}
		}
    	peerRoom.delete(peer.id)  // ← nettoie quand le joueur se déconnecte
    	console.log('Joueur déconnecté')
	}
})
