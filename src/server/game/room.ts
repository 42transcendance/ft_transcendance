import { Game } from "./game"
import type { Peer } from "crossws"
import { ServerMessage } from './type'

/**
 * Représente une salle de jeu (room).
 * Gère un groupe de joueurs et leur progression à travers les états
 * waiting → starting → playing → finished.
 */
export class Room {
	private startTimer: ReturnType<typeof setTimeout> | null = null;
	readonly maxPlayer: number;

	playerSockets: Peer[] = [];
	currPlayer: number = 0;
	states: "waiting" | "starting" |  "playing" | "finished";
	game: Game | null;
	
	/**
     * @param max - Nombre maximum de joueurs dans la room
     */
	constructor(max: number) {
		this.maxPlayer = max;
		this.states = "waiting";
		this.game = null;
	}

    /**
     * Retourne l'index d'un joueur dans la liste des sockets.
     * Cet index sert également d'identifiant interne au joueur.
     *
     * @param peer - Socket du joueur à identifier
     * @returns Index du joueur, ou -1 s'il n'est pas dans la room
     */
	get_id(peer: Peer): number {
		return (this.playerSockets.indexOf(peer));
	}

    /**
     * Ajoute un joueur à la room si elle n'est pas pleine,
     * puis met à jour son état.
     *
     * @param player - Socket du joueur à ajouter
     */
	add_player(player: Peer) {
		if (this.currPlayer < this.maxPlayer) {
			this.currPlayer++;
			this.playerSockets.push(player);
		}

		this.update_room_state();
	}

    /**
     * Retire un joueur de la room.
     * Si une partie est en cours, élimine le joueur du jeu.
     * Si le compte à rebours est en cours, l'annule et repasse en attente.
     *
     * @param player - Socket du joueur à retirer
     */
	remove_player(player: Peer) {
		const id = this.get_id(player);

		if (id >= 0) {
			if (this.game) {
				this.game.kill_player(id);
			}
			if (this.states === "starting" && this.startTimer) {
				clearTimeout(this.startTimer);
				this.startTimer = null;
				this.broadcast({ type: 'waiting' });
			}
			this.playerSockets.splice(id, 1);
			this.currPlayer--;
		}
	
		this.update_room_state();
	}
	
    /**
     * Met à jour l'état de la room en fonction du nombre de joueurs présents.
     * Passe en "waiting" si la room n'est pas pleine,
     * en "starting" si elle vient de se remplir.
     */
	update_room_state() {
		if (this.currPlayer < this.maxPlayer && (this.states !== "playing" || this.states !== "finished") {
			this.states = "waiting";
		}
		else if (this.currPlayer == this.maxPlayer) {
			this.states = "starting";
		}
	}
	
    /**
     * Diffuse un message à tous les joueurs connectés à la room.
     *
     * @param message - Objet à envoyer (sera sérialisé en JSON)
     */
	broadcast(message: any) {
		for (const peer of this.playerSockets) {
			peer.send(JSON.stringify(message))
		}
	}

    /**
     * Démarre le compte à rebours de 10 secondes avant le lancement de la partie.
     * À la fin du timer, crée l'instance Game, l'initialise, et notifie les joueurs.
     * Le timer peut être annulé via `remove_player` si un joueur quitte avant la fin.
     */
	start_game() {
		if (this.states !== "starting") {
			return ;
		}
		console.log("starting game in 10 secs !")

		this.startTimer = setTimeout(() => {
			console.log("starting game !");
			const newGame = new Game(this.maxPlayer);
			newGame.init_game();
			this.game = newGame;
			
			const message: ServerMessage = {
				type: 'playing',
			}
			this.broadcast(message);
			this.states = "playing";
		}, 10000);
	}

    /**
     * Vérifie si la partie est terminée et notifie les joueurs si c'est le cas.
     */
	end_game() {
		if (this.game && this.game.state === "over") {
			this.states = "finished";
			const end_msg: ServerMessage = {
				type: 'finished',
			}
			this.broadcast(end_msg);
		}
	}
}
