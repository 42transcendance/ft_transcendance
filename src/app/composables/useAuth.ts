export const useAuth = () => {

	const currentUser = useState('currentUser', () => null)

	const login = async (username, password) => {
		try {
			const user = await $fetch(`api/users/login?name=${username}&pswd=${password}`)
			// const user = mockUsers.find(u => u.username === username && u.password === password)
			if (user && user.id) {
				currentUser.value = user
				return true
			}
			return false
		}
		catch (e) {
			console.error("Failed request : ", e.statusText)
			return false
		}
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
