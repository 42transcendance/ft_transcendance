import { GAME, PLAYER, CELL } from "~shared/game/constants"
import { Player } from "./player"
import { Cell } from "~shared/game/cell"
import { Grid } from "~shared/game/grid"

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
    		const new_p = new Player(startCell, PLAYER.COLOR[i], i)
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
	 * Met a l'état 'over' si il ne reste qu'un joueur en vie
	 */
	actualize() {
		var dead_player: number = 0;

		this.players.forEach((player, index) => {
			this.p_painted_cell[index] = this.p_painted_cell[index].filter(cell => cell.color === player.color);
			if (this.p_painted_cell[index].length === 0)
				dead_player++;
		});
		if (dead_player === this.players.length - 1)
			this.state = "over";
	}

	/**
	 *
	 */
	get_winner(): number {
		let max_painted: number = 0;
		let winner_id: number = 0;
		this.players.forEach((player, index) => {
			let curr_painted: number = this.p_painted_cell[index].length;
			if (curr_painted > max_painted) {
				max_painted = curr_painted;
				winner_id = player.id;
			}
			else if (curr_painted === max_painted) { //gere l'égalité
				winner_id = -1;
			}
		});
		return (winner_id);
	}

	get_painted(id: number): number {
		return (this.p_painted_cell[id].length);
	}

	get_clicked(id: number): number {
		return (this.players[id].nbr_clkd);
	}
	
	/**
	* Supprime toutes les cases peintes d'un joueur en particulier.
	* @param id - Identifiant du joueur à supprimer
	*/
	kill_player(id: number) {
		this.p_painted_cell[id].forEach((cell) => {
			cell.color = CELL.COLOR;
		});
	}
}
