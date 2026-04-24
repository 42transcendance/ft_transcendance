export const useAuth = () => {

	const currentUser = useState('currentUser', () => null)
	const token = useCookie('auth_token', {
		path: '/',
		watch: true
	})

	const login = async (username, password) => {
		try {
			const data = await $fetch('/api/users/login', {
				method: 'POST',
				body: {username, password}
			})
			currentUser.value = data.safeUser
			return true
		}
		catch (e) {
			console.error("Failed request : ", e.statusText)
			return false
		}
	}

	const logout = async () => {
		await $fetch('/api/users/logout', { method: 'POST' })
		currentUser.value = null
		token.value = null
		await navigateTo('/')
	}

	const create = async (email, username, password) => {
		try {
			const data = await $fetch('/api/users/create', {
				method: 'POST',
				body: {email, username, password}
			})
			currentUser.value = data.safeUser
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
