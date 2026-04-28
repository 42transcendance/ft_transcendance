<script setup lang="ts"></script>

<template>
	<div class="navbar">
		<NavBtnsHomeBtn class="home-btn"/>
		<NavBtnsGameBtn class="game-btn" />
		<NavBtnsTitleBtn class="title-btn"/>
		<NavBtnsSearchBar class="search-bar"/>
		<NavBtnsProfileBtn class="profile-btn"/>
		<NavBtnsLogoutBtn class="logout-btn"/>
	</div>

</template>

<style scoped>
/* Navigation bar style */
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 60px;
		background-color: #ffffff;
		z-index: 3000;
		display: flex;
		align-items: center;
		box-shadow: 0 2px 5px rgba(0,0,0,0.1);
		padding: 0 20px;
		box-sizing: border-box;
	}

/* Home button style */
	.home-btn {
		width: 6%;
		text-align: center;
	}

/* Game button style */
	.game-btn {
		width: 6%;
		text-align: center;
	}

/* title button style */
	.title-btn {
		width: 6%;
		text-align: center;
	}


/* Search bar style */
	.search-bar {
		display: flex;
		flex-grow: 1;
	}

/* Profile button style */
	.profile-btn {
		width: 6%;
		text-align: center;
	}

/* Logout button style */
	.logout-btn {
		width: 6%;
		text-align: center;
	}
</style>
