export const CELL_INFO = {
	SIZE: 25,
	COLOR: "white",
};

export const PLAYER_INFO = {
	COLOR: ["green", "red", "magenta", "blue"],
}

export const GAME = {
	CELLS_W: 50,
	CELLS_H: 50,
}

// For WIDTH and HEIGHT, must be % CELL_SIZE.
// Creer un canvas_info pour taille et longueur
export const GRID_INFO = {
	WIDTH: CELL_INFO.SIZE * GAME.CELLS_W + 7,
	HEIGHT: CELL_INFO.SIZE * GAME.CELLS_H + 7,
	ROW:  GAME.CELLS_H,
	COL: GAME.CELLS_W,
	BORDER: CELL_INFO.SIZE / 10,
}
