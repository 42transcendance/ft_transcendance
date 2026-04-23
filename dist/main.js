import { GRID_INFO } from "./constants.js";
import { fillBackground } from "./grid.js";
import { Game } from "./game.js";
const canvas = document.getElementById("pixel-fight");
const button = document.getElementById("paint-button");
canvas.width = GRID_INFO.WIDTH * 2;
canvas.height = GRID_INFO.HEIGHT * 2;
const ctx = canvas.getContext("2d");
fillBackground(ctx);
var game = new Game(2);
game.init_game(ctx);
button.addEventListener("click", () => {
    game.players.forEach(player => {
        player.paint(ctx, game.board, game);
    });
    game.actualize();
});
console.log(ctx);
//# sourceMappingURL=main.js.map