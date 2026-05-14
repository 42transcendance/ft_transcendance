export const useAuth = () => {
	const { closeProfile } = useProfile()
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
			return { success: true }
		}
		catch (e) {
			return { success: false, error: e.data?.message || 'Login failed' }
		}
	}

	const logout = async () => {
		await $fetch('/api/users/logout', { method: 'POST' })
		currentUser.value = null
		token.value = null
		closeProfile()
		await navigateTo('/')
	}

	const create = async (email, username, password) => {
		try {
			const data = await $fetch('/api/users/create', {
				method: 'POST',
				body: {email, username, password}
			})
			currentUser.value = data.safeUser
			return { success: true }
		}
		catch (e) {
			return { success: false, error: e.data?.message || 'Creation failed' }
		}

	}


	return {
		currentUser,
		login,
		logout,
		create
	}
}
