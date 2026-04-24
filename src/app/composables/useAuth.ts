export const useAuth = () => {

	const currentUser = useState('currentUser', () => null)
	const token = useCookie('auth_token', {
		path: '/',
		watch: true
	})

	const login = async (username, password) => {
		try {
			const data = await $fetch('/api/login', {
				method: 'POST',
				body: {username, password}
			})
			currentUser.value = data
			return true
		}
		catch (e) {
			console.error("Failed request : ", e.statusText)
			return false
		}
	}

	const logout = async () => {
		await $fetch('/api/logout', { method: 'POST' })
		currentUser.value = null
		token.value = null
	}

	const create = async (email, username, password) => {
		try {
			const data = await $fetch('/api/users', {
				method: 'POST',
				body: {email, username, password}
			})
			currentUser.value = data
			return true
		}
		catch (e) {
			console.error("Failed request : ", e.statusText)
			return false
		}

	}


	return {
		currentUser,
		login,
		logout,
		create
	}
}
