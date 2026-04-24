import { WebSocket, WebSocketServer } from "ws";
import { GAME } from "./constants.js";
import { Game } from "./game.js";
// Cree le serveur au port 8080
const wss = new WebSocketServer({ port: 8080 });
/** Instance unique du jeu, partagée entre tous les joueurs connectés */
var game = new Game(GAME.PLAYERS);
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
    const playerSocket = client;
    playerSocket.playerId = nextId++;
    // Envoie l'état initial de la grille au joueur qui vient de se connecter
    const message = {
        type: "cell_init",
        cells: game.board.grid.flat(),
    };
    playerSocket.send(JSON.stringify(message));
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
            var cell = game.players[playerSocket.playerId].paint(game.board, game);
            // Broadcast la case modifiée à tous les clients actifs
            const broadcast = {
                type: "cell_update",
                cell: cell,
            };
            wss.clients.forEach((client) => {
                if (client.readyState == WebSocket.OPEN) {
                    client.send(JSON.stringify(broadcast));
                }
            });
        }
        game.actualize();
    });
});
//# sourceMappingURL=server.js.map