import { Game } from "./game"
import type { Peer } from "crossws"

export class Room {
	readonly maxPlayer: number;

	playerSockets: Peer[] = [];
	currPlayer: number = 0;
	states: "waiting" | "starting" |  "playing" | "finished";
	game: Game | null;
	
	constructor(max: number) {
		this.maxPlayer = max;
		this.states = "waiting";
		this.game = null;
	}

	getState() {
		return this.states;
	}

	add_player(player: Peer) {
		this.currPlayer++;

		if (this.currPlayer <= this.maxPlayer)
			playerSockets.push(player);
		else {
			this.currPlayer--;
		}
	}
	
	update_room_state() {
		if (this.currPlayer < this.maxPlayer) {
			this.states = "waiting";
		}
		else if (this.currPlayer == this.maxPlayer) {
			this.states = "starting";
		}
	}

	start_game() {
		if (this.states !== "starting") {
			return ;
		}
		console.log("starting game in 10 secs !")

		setTimeout(() => {
			console.log("starting game !");
			this.game = new Game(this.maxPlayer);
			this.states = "playing";
		}, 10000);
	}

	end_game() {
		if (this.game.state === "over") {
			this.states = "finished";
		}
	}
}
