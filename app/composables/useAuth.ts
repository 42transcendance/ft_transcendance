export const useAuth = () => {

	const currentUser = useState('currentUser', () => null)

	const login = (username, password) => {
		const user = mockUsers.find(u => u.username === username && u.password === password)
		if (user) {
			currentUser.value = user
			return true
		}
		return false
	}

	const logout = () => {
		currentUser.value = null
	}

	return {
		currentUser,
		login,
		logout
	}
}
