import { CELL_INFO } from "./constants.js"
import { GAME } from "./constants.js"
import { PLAYER_INFO } from "./constants.js"
import { Grid } from "./grid.js"
import { Point } from "./type.js"

/**
 * Représente une case de la grille de jeu.
 * Contient sa position, sa taille et sa couleur courante.
 */
export class Cell {
	readonly pospx: Point;
	readonly pos: Point;
	readonly size: number;

	color: string;

	constructor(pos: Point)
	constructor(pos: Point, size: number, color: string)

	/**
     * @param pos - Position en indices de grille
     * @param size - Taille de la case en pixels (défaut : CELL_INFO.SIZE)
     * @param color - Couleur initiale (défaut : CELL_INFO.COLOR)
     */
	constructor(pos: Point, size?: number, color?: string) {
		this.pos = {x: pos.x, y: pos.y}
		this.size = (size ?? CELL_INFO.SIZE);
		this.pospx = {x: (pos.x * this.size + 10), y: (pos.y * this.size + 10)};
		// Permet de rendre visible les intersections de cases size - 3 => 3 pixels de bordure visible.
		this.size -= 3;
		this.color = color ?? CELL_INFO.COLOR;
	}

    /**
     * Vérifie si la case appartient à un joueur donné.
     * @param color - Couleur du joueur à vérifier
     * @returns `true` si la case a cette couleur
     */
	is_painted(color: string) {
		return (color === this.color)
	}

    /**
     * Vérifie si les 4 cases adjacentes (haut, bas, gauche, droite)
     * appartiennent toutes à un joueur donné.
     * @param color - Couleur du joueur à vérifier
     * @param grid - Grille de jeu contenant toutes les cases
     * @returns `true` si toutes les cases adjacentes ont cette couleur ou en dehors de la grille
     */
	is_surrounded(color: string, grid: Grid) {
		let new_dir: Point[] = [{x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}];

		while (new_dir.length > 0) {
			let check: Cell;
			let index: number = Math.floor(Math.random() * new_dir.length);
			let new_x = this.pos.x + new_dir[index].x;
			let new_y = this.pos.y + new_dir[index].y;
			new_dir.splice(index, 1);

			if ((new_x < 0 || new_x >= GAME.CELLS_W) || (new_y < 0 || new_y >= GAME.CELLS_H))
				return true ;
			
			check = grid.grid[new_x][new_y];
			
			if (check.color !== color)
				return false;
		}
		return true;
	}
}
