<script setup lang="ts">
</script>



<template>
	<nav class="navbar">
		<NavBtnsHomeBtn class="home-btn"/>
		<NavBtnsSearchBar class="search-bar"/>
		<NavBtnsLogBtn class="log-btn"/>
	</nav>	
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

/* search bar style */
	.search-bar {
		display: flex;
		flex-grow: 1;
	}


/* Log button style */
	.log-btn {
		width: 6%;
		text-align: center;
	}

</style>
