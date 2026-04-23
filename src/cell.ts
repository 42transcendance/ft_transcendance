import { CELL_INFO } from "./constants.js"
import { GAME } from "./constants.js"
import { PLAYER_INFO } from "./constants.js"
import { Grid } from "./grid.js"
import { Point } from "./type.js"

export class Cell {
	readonly pospx: Point;
	readonly pos: Point;
	readonly size: number;

	color: string;

	constructor(pos: Point)
	constructor(pos: Point, size: number, color: string)

	constructor(pos: Point, size?: number, color?: string) {
		this.pos = {x: pos.x, y: pos.y}
		this.size = (size ?? CELL_INFO.SIZE);
		this.pospx = {x: (pos.x * this.size + 10), y: (pos.y * this.size + 10)};
		this.size -= 3;
		this.color = color ?? CELL_INFO.COLOR;
	}

	draw_cell(ctx: any): void {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pospx.x, this.pospx.y, this.size, this.size);
	}

	is_painted(color: string) {
		if (color == this.color)
			return true;
		return (false);
	}

	is_surrounded(color: string, grid: Grid) {
		let to_check = [-1, +1];

		for (let i = 0; i < 4; i++) {
			let check: Cell;
			let new_x = this.pos.x + to_check[i % 2];
			let new_y = this.pos.y + to_check[i % 2];

			if ((new_x < 0 || new_x > GAME.CELLS_W) || (new_y < 0 || new_y > GAME.CELLS_H))
				break;
			
			if (i < 2) {
				check = grid.grid[new_x][this.pos.y];
			} else {
				check = grid.grid[this.pos.x][new_y];
			}
			
			if (check.color != color)
				return false;
		}
		return true;
	}
}
