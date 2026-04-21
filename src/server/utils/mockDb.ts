import { User } from "~/types/user"

export const mockUsers: User[] = [
	{ id: 1, username: 'Marvin', password: '123456', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marvin', level: 42, status: 'online', friends: [2] },
	{ id: 2, username: 'Alice', password: 'password', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', level: 10, status: 'offline', friends: [1] },
	{ id: 3, username: 'Bob', password: 'coucou', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', level: 5, status: 'ingame', friends: [] },
];
