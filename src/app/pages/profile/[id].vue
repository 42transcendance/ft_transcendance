<script setup lang="ts">
	// middleware protection
	definePageMeta({
		middleware: 'auth'
	})

	const route = useRoute()
	const { currentUser } = useAuth()

	// Récupération du profil
	const { data: user, error } = await useFetch(`/api/users/${route.params.id}`)

	if (error.value) {
		throw createError({ statusCode: 404, message: 'User not found' })
	}

	const isOwner = computed(() =>
		String(currentUser.value?.id) === String(route.params.id)
	)

	const fileInput = ref<HTMLInputElement | null>(null)
	const previewImage = ref<string | null>(user?.value?.safeUser?.avatarUrl || null)
	const uploadError = ref('')
</script>

<template>
	<div class="profile-wrapper">
		<h1 class="profile-title">
			{{ isOwner ? 'Your Profile' : `${user?.safeUser?.username}'s Profile` }}
		</h1>

		<div class="avatar-section">
			<img
				:src="previewImage || '/default-avatar.jpg'"
				alt="Avatar"
				class="avatar-preview"
			/>
		</div>

		<div class="info-section">
			<p><strong>Username :</strong> {{ user?.safeUser?.username }}</p>
			<template v-if="isOwner">
				<NuxtLink to="/profile/settings">Modify</NuxtLink>
			</template>
		</div>
	</div>
</template>

<style scoped>
	.profile-wrapper {
		border: 1px solid #ccc;
		padding: 10px;
		margin-top: 10px;
	}

	.profile-title {
		text-align: center;
		align-items: center;
		gap: 20px;
	}

	.avatar-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.avatar-preview {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #ddd;
		justify-content: center;
	}

	.info-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.hidden {
		display: none;
	}
</style>
