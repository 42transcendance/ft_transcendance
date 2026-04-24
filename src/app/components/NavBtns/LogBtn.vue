<script setup lang="ts">
	const { currentUser, logout } = useAuth()

	const logOption = computed(() => {
		return currentUser.value ? 'Logout' : 'Login'
	})
</script>

<template>
	<div class="log-wrapper">
		<ClientOnly>
			<button v-if="currentUser" @click="logout" class="logout-btn">
				{{ logOption }}
			</button>

			<NuxtLink v-else to="/login" class="login-btn">
				{{ logOption }}
			</NuxtLink>

			<template #fallback>
				<span class="fallback-skeleton">Charging</span>
			</template>
		</ClientOnly>
	</div>
</template>

<style scoped>
	.log-wrapper {
		display: block;
		width: 100%;
	}

	.login-btn {
		font-family: "Courier New";
		font-size: 16px;
		font-weight: bold;
		text-decoration: none;
		color: #333;
		cursor: pointer;
	}

	.logout-btn {
		font-family: "Courier New";
		font-size: 16px;
		font-weight: bold;
		text-decoration: none;
		color: #333;
		border: none;
		background: none;
		cursor: pointer;
	}

	.fallback_skeleton {
		font-family: "Courier New";
		font-size: 16px;
		font-weight: bold;
		text-decoration: none;
		color: #333;
		cursor: pointer;
	}

</style>
