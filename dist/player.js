import { GAME } from "./constants.js";
export class Player {
    // painted: Cell[] = [];
    constructor(home, color, id) {
        this.color = color;
        home.color = color;
        this.home = home;
        this.id = id;
        this.nbr_ptd = 0;
    }
    init_player(ctx, grid) {
        // this.painted.push(this.home);
        this.home.draw_cell(ctx);
        this.nbr_ptd++;
    }
    paint(ctx, grid, game) {
        var is_surrounded = true;
        var start;
        do {
            let r_i = Math.floor(Math.random() * game.p_painted_cell[this.id].length);
            start = game.p_painted_cell[this.id][r_i];
            if (!start.is_surrounded(this.color, grid))
                is_surrounded = false;
        } while (is_surrounded);
        let to_check = [-1, +1];
        for (let i = 0; i < 4; i++) {
            let check;
            let new_x = start.pos.x + to_check[i % 2];
            let new_y = start.pos.y + to_check[i % 2];
            if ((new_x < 0 || new_x > GAME.CELLS_W) || (new_y < 0 || new_y > GAME.CELLS_H))
                break;
            if (i < 2) {
                check = grid.grid[new_x][start.pos.y];
            }
            else {
                check = grid.grid[start.pos.x][new_y];
            }
            if (!check.is_painted(this.color)) {
                check.color = this.color;
                check.draw_cell(ctx);
                game.p_painted_cell[this.id].push(check);
                this.nbr_ptd++;
                break;
            }
        }
    }
}
//# sourceMappingURL=player.js.map