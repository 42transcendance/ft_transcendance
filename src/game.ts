import { GAME, GRID_INFO, PLAYER_INFO } from "./constants.js"
import { Player } from "./player.js"
import { Cell } from "./cell.js"
import { Grid } from "./grid.js"

export class Game {
	readonly players: Player[] = [];
	readonly board: Grid;
	
	p_painted_cell: Cell[][] = [];

	constructor(nb_players: number) {
		this.board = new Grid(GAME.CELLS_H, GAME.CELLS_W);

		for (let i = 0; i < nb_players; i++) {
			var new_p = new Player(this.board.grid[i + 5][i + 5], PLAYER_INFO.COLOR[i], i);
			this.players.push(new_p);
			this.p_painted_cell[i] = [];
		}
	}

	init_game(ctx: any) {
		this.board.fillGrid(ctx);

		for (let i = 0; i < this.players.length; i++) {
			this.players[i].init_player(ctx, this.board);
			this.p_painted_cell[i].push(this.players[i].home);
		}
	}

	actualize() {
		this.players.forEach((player, index) => {
			this.p_painted_cell[index] = this.p_painted_cell[index].filter( cell => cell.color === player.color);
		});
	}
}
