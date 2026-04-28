import { Cell } from "./cell"

export type Point = {
	x: number;
	y: number;
};

export type ServerMessage =
	| { type: "cell_init"; cells: Cell[] }
	| { type: "cell_update"; cell: Cell }
