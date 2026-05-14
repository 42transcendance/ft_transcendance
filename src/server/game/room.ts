import { Game } from "./game"
import { TIMER } from "~shared/game/constants"
import type { Peer } from "crossws"
import { ServerMessage } from '~shared/game/type'
import { rooms, peerRoom } from '../utils/gameState'
import { sendToUser, getPeers } from '../utils/peers'

/**
 * Représente une salle de jeu (room).
 * Gère un groupe de joueurs et leur progression à travers les états
 * waiting → starting → playing → finished.
 */
export class Room {
	private startTimer: ReturnType<typeof setTimeout> | null = null;
	private gameTimer: ReturnType<typeof setTimeout> | null = null;
	readonly maxPlayer: number;
	public startedAt: number | null = null;
    public gameStartedAt: number | null = null;
	public waitStartedAt: number | null = null;
	public usernames = new Map<string, string>();


	userIds: string[] = [];
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


	get_id_by_userId(userId: string): number {
        return this.userIds.indexOf(userId)
    }
    /**
     * Retourne l'index d'un joueur dans la liste des sockets.
     * Cet index sert également d'identifiant interne au joueur.
     *
     * @param peer - Socket du joueur à identifier
     * @returns Index du joueur, ou -1 s'il n'est pas dans la room
     */
	get_id(peer: Peer): number {
		return this.userIds.indexOf(peer.ctx.userId);
	}


	get_stats_by_userId(userId: string): { painted: number, clicked: number } {
        const id = this.get_id_by_userId(userId)
        return {
            painted: this.game?.get_painted(id) ?? 0,
            clicked: this.game?.get_clicked(id) ?? 0,
        }
    }
	/**
	 *
	 */
	get_stats(peer: Peer): ServerMessage {
		const	stats = this.get_stats_by_userId(peer.ctx.userId)
		const statsMsg: ServerMessage = {
			type: 'stats',
			painted: stats.cell_painted,
			clicked: stats.nbr_clicked,
		}
		return (statsMsg);
	}

    /**
     * Ajoute un joueur à la room si elle n'est pas pleine,
     * puis met à jour son état.
     *
     * @param player - Socket du joueur à ajouter
     */
	add_player(peer: Peer) {
        const userId = peer.ctx.userId;
        if (!this.userIds.includes(userId) && this.currPlayer < this.maxPlayer) {
            this.userIds.push(userId);
			this.usernames.set(userId, peer.ctx.username)
            this.currPlayer++;
        }
		if (this.currPlayer === 1 && !this.waitStartedAt) {
            this.waitStartedAt = Date.now()
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
	remove_player(userId: string) {
		const id = this.userIds.indexOf(userId)
		if (id >= 0) {
			if (this.game)
				this.game.kill_player(id)
			if (this.states === "starting" && this.startTimer) {
				clearTimeout(this.startTimer)
				this.startTimer = null
				this.broadcast({ type: 'waiting' })
			}
			this.userIds.splice(id, 1)
			this.currPlayer--
		}
		this.update_room_state()
	}
	
    /**
     * Met à jour l'état de la room en fonction du nombre de joueurs présents.
     * Passe en "waiting" si la room n'est pas pleine,
     * en "starting" si elle vient de se remplir.
     */
	update_room_state() {
		if (this.currPlayer < this.maxPlayer && (this.states !== "playing" && this.states !== "finished")) {
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
        for (const userId of this.userIds)
            sendToUser(userId, message)
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
		console.log("starting game in few secs !")

		this.waitStartedAt = null
		this.startedAt = Date.now();
		this.startTimer = setTimeout(() => {
			console.log("starting game !");
			this.startedAt = null;
			const newGame = new Game(this.maxPlayer);
			newGame.init_game();
			this.game = newGame;
			
			const message: ServerMessage = {
				type: 'playing',
			}
			this.broadcast(message);
			this.states = "playing";
			this.game_timer();

		}, TIMER.LAUNCHING * 1000);
	}

	/**
	 * Démarre le compte a rebours de la partie.
	 * À la fin du timer, passe la room à l'état 'finished' et notifie les joueurs.
     * Le timer peut être annulé via `remove_player` si un joueur quitte avant la fin.
	 */
	game_timer() {
		if (this.states !== "playing")
			return ;

		this.gameStartedAt = Date.now();
		this.gameTimer = setTimeout(() => {
			this.game.state = "over";
			this.end_game();
		}, TIMER.GAME * 1000);
	}

    /**
     * Vérifie si la partie est terminée et notifie les joueurs si c'est le cas.
     */
	end_game() {
		if (this.game && this.game.state === "over") {
			this.states = "finished"
			const	winner_id = this.game.get_winner()
			const	winnerUserId = this.userIds[winner_id]
            const	winnerUsername = this.usernames.get(winnerUserId) ?? 'Unknown'
			let		is_eq = false;
			if (winner_id === -1)
				is_eq = true;
{
			for (const userId of this.userIds) {
				const stats = this.get_stats_by_userId(userId);
				const end_msg: ServerMessage = {
					type: 'finished',
					winner: winner_id,
					winnerUsername: winnerUsername,
					is_eq: is_eq,
					painted: stats.painted,
					clicked: stats.clicked,
				};

				sendToUser(userId, end_msg))
			}
		}
	}
}
