import { GAME, PLAYER_INFO } from "./constants.js";
import { Player } from "./player.js";
import { Grid } from "./grid.js";
export class Game {
    constructor(nb_players) {
        this.players = [];
        this.p_painted_cell = [];
        this.board = new Grid(GAME.CELLS_H, GAME.CELLS_W);
        for (let i = 0; i < nb_players; i++) {
            var new_p = new Player(this.board.grid[1][1], PLAYER_INFO.COLOR[i], i);
            this.players.push(new_p);
            this.p_painted_cell[i] = [];
        }
    }
    init_game() {
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].init_player(this.board);
            this.p_painted_cell[i].push(this.players[i].home);
        }
    }
    actualize() {
        this.players.forEach((player, index) => {
            this.p_painted_cell[index] = this.p_painted_cell[index].filter(cell => cell.color === player.color);
        });
    }
}
//# sourceMappingURL=game.js.map