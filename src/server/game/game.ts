import { GAME, GRID_INFO, PLAYER_INFO } from "./constants"
import { Player } from "./player"
import { Cell } from "./cell"
import { Grid } from "./grid"

/**
 * Classe principale du jeu, gère l'état global de la partie.
 * Vit côté serveur — ne contient aucune logique de rendu.
 */
export class Game {
	readonly players: Player[] = [];
	readonly board: Grid;

	p_painted_cell: Cell[][] = [];
	state: "on-going" | "over";

	/**
	 * @param nb_players - Nombre de joueurs dans la partie
	 */
	constructor(nb_players: number) {
		this.board = new Grid(GAME.CELLS_H, GAME.CELLS_W);
		  const startPositions = [
			{ x: 1, y: 1 },                                      // joueur 0 → haut gauche
			{ x: GAME.CELLS_W - 2, y: GAME.CELLS_H - 2 }        // joueur 1 → bas droite
		]

		for (let i = 0; i < nb_players; i++) {
			const startCell = this.board.grid[startPositions[i].x][startPositions[i].y]
    		const new_p = new Player(startCell, PLAYER_INFO.COLOR[i], i)
			this.players.push(new_p);
			this.p_painted_cell[i] = [];
		}
		this.state = "on-going";
	}

	/**
	 * Initialise la partie en plaçant chaque joueur sur la grille
	 * et en enregistrant leur case de départ.
	 */
	init_game() {
		for (let i = 0; i < this.players.length; i++) {
			this.players[i].init_player();
			this.p_painted_cell[i].push(this.players[i].home);
		}
	}

	/**
	 * Synchronise `p_painted_cell` avec l'état réel de la grille.
	 * Retire les cases qui ont été repeintes par un autre joueur.
	 */
	actualize() {
		this.players.forEach((player, index) => {
			this.p_painted_cell[index] = this.p_painted_cell[index].filter(cell => cell.color === player.color);
		});
	}

	is_finished() {
		var cpt: number = 0;
		this.players.forEach((player, index) => {
			if (this.p_painted_cell[index].length === 0) {
				cpt++;
			}
		});

		if (cpt >= this.player.length - 1) {
			this.state = "over";
		}
	}
}
