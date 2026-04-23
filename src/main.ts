import { GRID_INFO, GAME, PLAYER_INFO } from "./constants.js"
import { fillBackground, Grid } from "./grid.js";
import { Game } from "./game.js";

const canvas = document.getElementById("pixel-fight") as HTMLCanvasElement;
const button = document.getElementById("paint-button") as HTMLButtonElement;

canvas.width = GRID_INFO.WIDTH * 2;
canvas.height = GRID_INFO.HEIGHT * 2;

const ctx = canvas.getContext("2d")!;

fillBackground(ctx);

var game: Game = new Game(2);

game.init_game(ctx);

button.addEventListener("click", () => {
	game.players.forEach( player => {
		player.paint(ctx, game.board, game);
	});
	game.actualize();
});


console.log(ctx);
