import { Cell } from "./cell.js";
export class Grid {
    constructor(row, col) {
        this.grid = [];
        this.row = row;
        this.col = col;
        for (let x = 0; x < col; x++) {
            this.grid[x] = [];
            for (let y = 0; y < row; y++) {
                this.grid[x][y] = new Cell({ x, y });
            }
        }
    }
    fillGrid(ctx) {
        for (let x = 0; x < this.col; x++) {
            for (let y = 0; y < this.row; y++) {
                ctx.fillStyle = this.grid[x][y].color;
                this.grid[x][y].draw_cell(ctx);
            }
        }
    }
}
//# sourceMappingURL=grid.js.map