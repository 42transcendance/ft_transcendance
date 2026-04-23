import { GRID_INFO, GAME, PLAYER_INFO } from "./constants.js"
import { WebSocket, WebSocketServer } from "ws";
import { Game } from "./game.js";

const wss = new WebSocketServer({ port: 8080 });

interface PlayerSocket extends WebSocket {
	playerId: number;
}

var game: Game = new Game(2);

let nextId = 0;

wss.on("connection", (client) => {
	const playerSocket = client as PlayerSocket;
	playerSocket.playerId = nextId++;
	playerSocket.send(JSON.stringify ({
		cells: game.board.grid.flat().map( cell => ({
			x: cell.pos.x,
			y: cell.pos.y,
			color: cell.color,
		}))
	}));
});

wss.on("message", (player) => {
	game.players[player.data.playerId].player.paint(game.board, game);
	game.actualize();

	player.send(JSON.stringify ({
		type: "cell_update",
		x: cell.pos.x,
		y: cell.pos.y,
		color: cell.color,
	}))
});
