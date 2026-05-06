import { GAME } from "~shared/game/constants"
import { Point } from "~shared/game/type"
import { Cell } from "~shared/game/cell"
import { Grid } from "~shared/game/grid"
import { Game } from "./game"

/**
 * Représente un joueur de la partie.
 * Gère sa position de départ, sa couleur et sa logique de peinture.
 */
export class Player {
	readonly home: Cell;
	readonly color: string;
	readonly id: number;

	nbr_clkd: number;

	/**
	 * @param home - Case de départ, immédiatement peinte à la couleur du joueur
	 * @param color - Couleur du joueur
	 * @param id - Identifiant unique
	 */
	constructor(home: Cell, color: string, id: number) {
		this.color = color;
		home.color = color;
		this.home = home;
		this.id = id;
		this.nbr_clkd = 0;
	}

	/**
	 * Initialise le joueur en comptabilisant sa case de départ.
	 */
	init_player() {
		this.nbr_clkd = 0;
	}

	/**
	 * Peint une case adjacente à la zone du joueur.
	 * Sélectionne aléatoirement une case déjà peinte non entièrement entourée,
	 * puis tente de peindre une case voisine dans une direction aléatoire.
	 *
	 * @param grid - Grille de jeu
	 * @param game - Instance du jeu pour accéder aux cases peintes
	 * @returns La case modifiée, ou la case de départ si aucune direction n'est disponible
	 */
	paint(grid: Grid, game: Game): Cell {
		var is_surrounded = true;
		var start: Cell;

		// Cherche aléatoirement une case peinte qui a encore des voisins libres
		do {
			let r_i: number = Math.floor(Math.random() * game.p_painted_cell[this.id].length);
			start = game.p_painted_cell[this.id][r_i];

			if (!start.is_surrounded(this.color, grid))
				is_surrounded = false;
		} while (is_surrounded);

		let new_dir: Point[] = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
		let check: Cell = start;

		while (new_dir.length > 0) {
			let index: number = Math.floor(Math.random() * new_dir.length);
			let new_x = start.pos.x + new_dir[index].x;
			let new_y = start.pos.y + new_dir[index].y;
			new_dir.splice(index, 1);

			if ((new_x < 0 || new_x >= GAME.CELLS_W) || (new_y < 0 || new_y >= GAME.CELLS_H))
				continue;

			check = grid.grid[new_x][new_y];

			// Peint la case si elle n'appartient pas déjà au joueur
			if (!check.is_painted(this.color)) {
				check.color = this.color;
				game.p_painted_cell[this.id].push(check);
				this.nbr_clkd++;
				break;
			}
		}
		return (check);
	}
}
