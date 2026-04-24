import { GRID_INFO, GAME, PLAYER_INFO } from "./constants.js"
import { WebSocket, WebSocketServer } from "ws";
import { Cell } from "./cell.js";
import { Game } from "./game.js";

// Cree le serveur au port 8080
const wss = new WebSocketServer({ port: 8080 });

/**
 * Extension du type WebSocket natif pour associer un identifiant
 * unique à chaque joueur connecté.
 */
interface PlayerSocket extends WebSocket {
	playerId: number;
}

/** Instance unique du jeu, partagée entre tous les joueurs connectés */
var game: Game = new Game(GAME.PLAYERS);
game.init_game();

/** Compteur d'identifiants, incrémenté à chaque nouvelle connexion */
let nextId = 0;

/**
 * Gère une connexion entrante d'un joueur.
 * Envoie l'état initial de la grille, et écoute ses actions.
 *
 * @param client - Le socket WebSocket du joueur connecté
 */
wss.on("connection", (client) => {
	const playerSocket = client as PlayerSocket;
	playerSocket.playerId = nextId++;

	// Envoie l'état initial de la grille au joueur qui vient de se connecter
	playerSocket.send(JSON.stringify ({
		type: "cell_init",
		cells: game.board.grid.flat(),
	}));

    /**
     * Gère une action de peinture envoyée par le joueur.
     * Peint une case adjacente à sa zone, actualise l'état du jeu,
     * puis broadcast la case modifiée à tous les clients connectés.
     *
     * @param data - Données brutes reçues du client (non utilisées directement)
     */
	playerSocket.on("message", (data) => {
		console.log("player :", playerSocket.playerId, "clicked on a button !");
		
        // Vérifie que le joueur est valide et possède des cases peintes
		if (playerSocket.playerId < GAME.PLAYERS && game.p_painted_cell[playerSocket.playerId].length !== 0) {
			var cell: Cell = game.players[playerSocket.playerId].paint(game.board, game);
		}

		game.actualize();
		
        // Broadcast la case modifiée à tous les clients actifs
		wss.clients.forEach( (client) => {
			if (client.readyState == WebSocket.OPEN) {
				client.send(JSON.stringify ({
					type: "cell_update",
					cell: cell,
				}));
			}
		});
	});
});

