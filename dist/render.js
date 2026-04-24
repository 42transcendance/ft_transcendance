import { GRID_INFO } from "./constants.js";
export function fillBackground(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, GRID_INFO.WIDTH + 10, GRID_INFO.HEIGHT + 10);
    ctx.fillStyle = "lightgray";
    ctx.fillRect(5, 5, GRID_INFO.WIDTH, GRID_INFO.HEIGHT);
}
function draw_cell(ctx, cell) {
    ctx.fillStyle = cell.color;
    ctx.fillRect(cell.pospx.x, cell.pospx.y, cell.size, cell.size);
}
export function render(ctx, state) {
    if (state.type === "cell_init") {
        state.cells.forEach((cell) => {
            draw_cell(ctx, cell);
        });
    }
    if (state.type === "cell_update") {
        draw_cell(ctx, state.cell);
    }
}
//# sourceMappingURL=render.js.map