import { CELL_INFO } from "./constants.js"
import { GRID_INFO } from "./constants.js"
import { Cell } from "./cell.js"


export class Grid {
	readonly row: number;
	readonly col: number;
	readonly grid: Cell[][] = [];

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

	fillGrid(ctx: any): void {
		for (let x = 0; x < this.col; x++) {
			for (let y = 0; y < this.row; y++) {
				ctx.fillStyle = this.grid[x][y].color;
				this.grid[x][y].draw_cell(ctx);
			}
		}
	}
}

export function fillBackground(ctx: any) {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, GRID_INFO.WIDTH + 10, GRID_INFO.HEIGHT + 10);

	ctx.fillStyle = "lightgray";
	ctx.fillRect(5, 5, GRID_INFO.WIDTH, GRID_INFO.HEIGHT);
}
