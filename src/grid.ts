import { Cell } from "./cell.js"

/**
 * Grille de jeu représentée comme un tableau 2D de cases.
 * Initialisée avec des cases vides à la couleur par défaut.
 */
export class Grid {
	readonly row: number;
	readonly col: number;
	readonly grid: Cell[][] = [];

    /**
     * @param row - Nombre de lignes
     * @param col - Nombre de colonnes
     */
	constructor(row: number, col: number) {
		this.row = row;
		this.col = col;

		for (let x = 0; x < col; x++) {
			this.grid[x] = [];
			for (let y = 0; y < row; y++) {
				this.grid[x][y] = new Cell({x, y});
			}
		}
	}
}
