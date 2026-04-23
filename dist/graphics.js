import { GRID_INFO } from "./constants.js";
export function fillBackground(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, GRID_INFO.WIDTH + 10, GRID_INFO.HEIGHT + 10);
    ctx.fillStyle = "lightgray";
    ctx.fillRect(5, 5, GRID_INFO.WIDTH, GRID_INFO.HEIGHT);
}
//# sourceMappingURL=graphics.js.map