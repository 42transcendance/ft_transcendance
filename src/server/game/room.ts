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

	get_id(peer: Peer): number {
		return (this.playerSockets.indexOf(peer));
	}

	add_player(player: Peer) {
		if (this.currPlayer < this.maxPlayer) {
			this.currPlayer++;
			this.playerSockets.push(player);
		}

		this.update_room_state();
	}

	remove_player(player: Peer) {
		const id = this.get_id(player);

		if (id >= 0) {
			this.playerSockets.splice(id, 1);
			this.currPlayer--;
		}
	
		this.update_room_state();
	}
	
	update_room_state() {
		if (this.currPlayer < this.maxPlayer) {
			this.states = "waiting";
		}
		else if (this.currPlayer == this.maxPlayer) {
			this.states = "starting";
		}
	}
	
	broadcast(message: any) {
		for (const peer of this.playerSockets) {
			peer.send(JSON.stringify(message))
		}
	}

	start_game() {
		if (this.states !== "starting") {
			return ;
		}
		console.log("starting game in 10 secs !")

		setTimeout(() => {
			console.log("starting game !");
			const newGame = new Game(this.maxPlayer);
			this.game = newGame;
			
			const message = {
				type: 'cell_init',
				cells: this.game.board.grid.flat()
			}
			this.broadcast(message);
			this.states = "playing";
		}, 10000);
	}

	end_game() {
		if (this.game && this.game.state === "over") {
			this.states = "finished";
		}
	}
}
