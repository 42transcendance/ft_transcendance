<script setup lang="ts"></script>

<template>
	<div class="navbar">
		<NavBtnsHomeBtn class="home-btn"/>
		<NavBtnsGameBtn class="game-btn" />
		<NavBtnsTitleBtn class="title-btn"/>
		<NavBtnsLoginBtn class="login-btn"/>
		<NavBtnsSignupBtn class="signup-btn"/>
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
		flex-grow: 1;
		text-align: center;
	}

/* Login button style */
	.login-btn {
		width: 6%;
		text-align: center;
	}

/* Signup button style */
	.signup-btn {
		width: 6%;
		text-align: center;
	}


</style>
