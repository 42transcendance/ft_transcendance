export const useAuth = () => {

	const currentUser = useState('currentUser', () => null)
	const token = useCookie('auth_token', {
		path: '/',
		watch: true
	})

	const login = async (username, password) => {
		try {
			const data = await $fetch('/api/users', {
				method: 'POST',
				body: {username, password}
			})
			currentUser.value = data.user
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

	const create = async () => {
		try {
			await $fetch('/api/users', {
				method: 'POST',
				body: {username, password}
			})
			currentUser.value = data.user
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
