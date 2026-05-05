import { Cell } from "./cell"

export type Point = {
	x: number;
	y: number;
};

export type ServerMessage =
	| { type: "cell_init"; cells: Cell[] }
	| { type: "cell_update"; cell: Cell }
	| { type: "waiting" }
	| { type: "starting" }
	| { type: "playing" }

export type ClientMessage =
	| { type: "paint"}
	| { type: "ready"}
