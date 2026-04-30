<script setup lang="ts">
	const { isProfileOpen, selectedUser, closeProfile } = useProfile()
	const previewImage = computed(() => {return selectedUser.value?.safeUser?.avatarUrl || null})
</script>

<template>
	<div :class="['side-profile', { 'is-open': isProfileOpen }]">
		<div v-if="selectedUser" class="profile-content">
			<button class="close-btn" @click="closeProfile">×</button>

			<img :src="previewImage || '/default-avatar.jpg'" alt="Avatar" class="avatar-preview" />
			<h2 class="profile-title">Profil de {{ selectedUser?.safeUser?.username }}</h2>
			<div v-if="selectedUser?.safeUser?.isOnline" class="user-online">
				<p>Online 🟢</p>
			</div>
			<div v-else class="user-offline">
				<p>Offline 🔴</p>
				<p>Last seen : {{ selectedUser?.safeUser?.lastSeenAt }}</p>
			</div>
		</div>
	</div>
</template>


<style scoped>
	.side-profile {
		position: fixed;
		top: 60px;
		right: 0;
		width: 400px;
		height: calc(100vh - 60px);
		background: white;
		z-index: 2000; /* Plus haut que la navbar */
		box-shadow: -5px 0 15px rgba(0,0,0,0.1);

		/* L'animation : on déplace la boîte de 100% vers la droite */
		transform: translateX(100%);
		transition: transform 0.3s ease-in-out;
	}

	/* Quand la classe 'is-open' est ajoutée, on remet le X à 0 */
	.side-profile.is-open {
		transform: translateX(0);
	}

	.avatar-preview {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #ddd;
		justify-content: center;
	}

	.profile-title {
		text-align: center;
		align-items: center;
		gap: 10px;
	}

	.profile-content {
		padding: 20px;
		padding-top: 60px; /* Pour ne pas être sous la navbar si besoin */
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.close-btn {
		position: absolute;
		top: 20px;
		right: 20px;
		font-size: 30px;
		border: none;
		background: none;
		cursor: pointer;
	}
</style>
