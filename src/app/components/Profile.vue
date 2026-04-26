<script setup lang="ts">
	const { isProfileOpen, selectedUser, closeProfile } = useProfile()
</script>

<template>
	<div :class="['side-profile', { 'is-open': isProfileOpen }]">
		<div v-if="selectedUser" class="profile-content">
			<button class="close-btn" @click="closeProfile">×</button>
			
			<h2>Profil de {{ selectedUser.safeUser.username }}</h2>
			<div class="user-info">
				<img :src="selectedUser.safeUser.avatar" class="avatar-large" />
				<p>Online : {{ selectedUser.safeUser.isOnline }}</p>
				<p>Last seen : {{ selectedUser.safeUser.lastSeenAt }}</p>
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


	.profile-content {
		padding: 20px;
		padding-top: 60px; /* Pour ne pas être sous la navbar si besoin */
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
