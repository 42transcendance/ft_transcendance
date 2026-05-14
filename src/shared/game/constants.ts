export const CELL = {
    SIZE: 25,
    GAP: 3,
    COLOR: "white",
}

export const PLAYER = {
    COLOR: ["green", "red", "magenta", "blue"],
}

export const GAME = {
    PLAYERS: 2,
    CELLS_W: 15,
    CELLS_H: 15,
}

const BORDER = 5

export const CANVAS = {
    BORDER,
    WIDTH:  BORDER * 2 + GAME.CELLS_W * CELL.SIZE,
    HEIGHT: BORDER * 2 + GAME.CELLS_H * CELL.SIZE,
}

export const TIMER = {
    GAME: 20,
    LAUNCHING: 10,
}
