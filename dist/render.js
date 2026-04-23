import { GRID_INFO, GAME } from "./constants.js";
export function fillBackground(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, GRID_INFO.WIDTH + 10, GRID_INFO.HEIGHT + 10);
    ctx.fillStyle = "lightgray";
    ctx.fillRect(5, 5, GRID_INFO.WIDTH, GRID_INFO.HEIGHT);
}
export function render(ctx, state) {
    for (let x = 0; x < GAME.CELLS_W; x++) {
        for (let y = 0; y < GAME.CELLS_H; y++) {
        }
    }
}
//# sourceMappingURL=render.js.map