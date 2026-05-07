import { GRID_INFO, GAME } from "~shared/game/constants"
import { ServerMessage } from "~shared/game/type"
import { Cell } from "~shared/game/cell"

/**
 * Dessine le fond de la grille — bordure noire et surface grise.
 * À appeler une seule fois à l'initialisation.
 * @param ctx - Contexte de dessin 2D
 */
export function fillBackground(ctx: any) {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, GRID_INFO.WIDTH + 10, GRID_INFO.HEIGHT + 10);

	ctx.fillStyle = "lightgray";
	ctx.fillRect(5, 5, GRID_INFO.WIDTH, GRID_INFO.HEIGHT);
}

/**
 * Dessine une case sur le canvas à sa position et avec sa couleur courante.
 * @param ctx - Contexte de dessin 2D
 * @param cell - Case à dessiner
 */
function draw_cell(ctx: any, cell: Cell): void {
	ctx.fillStyle = cell.color;
	ctx.fillRect(cell.pospx.x, cell.pospx.y, cell.size, cell.size);
}

/**
 * Point d'entrée du rendu côté client.
 * Dispatche l'affichage selon le type de message reçu du serveur.
 *
 * @param ctx - Contexte de dessin 2D
 * @param state - Message reçu du serveur via WebSocket
 */
export function render(ctx: any, state: ServerMessage) {
	if (state.type === "cell_init") {
		state.cells.forEach((cell) => {
			draw_cell(ctx, cell);
		});
	}
	if (state.type === "cell_update") {
		draw_cell(ctx, state.cell);
	}
}
