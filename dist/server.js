import { WebSocketServer } from "ws";
import { Game } from "./game.js";
const wss = new WebSocketServer({ port: 8080 });
var game = new Game(2);
let nextId = 0;
wss.on("connection", (client) => {
    const playerSocket = client;
    playerSocket.playerId = nextId++;
    playerSocket.send(JSON.stringify({
        cells: game.board.grid.flat().map(cell => ({
            x: cell.pos.x,
            y: cell.pos.y,
            color: cell.color,
        }))
    }));
});
wss.on("message", (player) => {
    game.players[player.data.playerId].player.paint(game.board, game);
    game.actualize();
    player.send(JSON.stringify({
        type: "cell_update",
        x: cell.pos.x,
        y: cell.pos.y,
        color: cell.color,
    }));
});
//# sourceMappingURL=server.js.map