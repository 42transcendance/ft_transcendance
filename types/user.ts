export interface User {
	id: number;
	username: string;
	password: string;
	avatar: string;
	level: number;
	status: 'online' | 'offline' | 'ingame';
	friends: number[];
}
