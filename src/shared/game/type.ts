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
	| { type: "finished", winner: number }
	| { type: "stats"; painted: number; clicked: number }

export type ClientMessage =
	| { type: "paint"}
	| { type: "ready"}
