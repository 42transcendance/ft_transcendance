// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	//srcDir: 'src/app',
	nitro: {
		experimental: {
			websocket: true  // ← ajouter ça
		}
	},

	runtimeConfig: {
		jwtSecret: process.env.NUXT_JWT_SECRET || 'dev-secret-key-change-in-production',
		apiKey: process.env.API_KEY || 'dev-api-key-change-in-production'
	}
})
