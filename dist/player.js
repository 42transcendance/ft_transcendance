import { GAME } from "./constants.js";
export class Player {
    constructor(home, color, id) {
        this.color = color;
        home.color = color;
        this.home = home;
        this.id = id;
        this.nbr_ptd = 0;
    }
    init_player(grid) {
        this.nbr_ptd++;
    }
    paint(grid, game) {
        var is_surrounded = true;
        var start;
        do {
            let r_i = Math.floor(Math.random() * game.p_painted_cell[this.id].length);
            start = game.p_painted_cell[this.id][r_i];
            if (!start.is_surrounded(this.color, grid))
                is_surrounded = false;
        } while (is_surrounded);
        let new_dir = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
        let check = start;
        while (new_dir.length > 0) {
            let index = Math.floor(Math.random() * new_dir.length);
            let new_x = start.pos.x + new_dir[index].x;
            let new_y = start.pos.y + new_dir[index].y;
            new_dir.splice(index, 1);
            if ((new_x < 0 || new_x >= GAME.CELLS_W) || (new_y < 0 || new_y >= GAME.CELLS_H))
                continue;
            check = grid.grid[new_x][new_y];
            if (!check.is_painted(this.color)) {
                check.color = this.color;
                game.p_painted_cell[this.id].push(check);
                this.nbr_ptd++;
                break;
            }
        }
        return (check);
    }
}
//# sourceMappingURL=player.js.map