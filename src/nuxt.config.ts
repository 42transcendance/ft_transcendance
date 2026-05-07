// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	debug: true,
	css: ['./app/assets/css/main.css'],
	vite: {
		plugins: [
			tailwindcss(),
		],
	},
	//srcDir: 'src/app',
	nitro: {
		experimental: {
			websocket: true  // ← ajouter ça
		}
	},

	runtimeConfig: {
		jwtSecret: '',
		metricsToken: ''
	},

	//Shared files for game server and client side
	alias: {
        '~shared': fileURLToPath(new URL('./shared', import.meta.url))
	},
})


