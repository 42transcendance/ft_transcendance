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
}
//# sourceMappingURL=grid.js.map