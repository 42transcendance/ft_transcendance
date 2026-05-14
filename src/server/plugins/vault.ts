export default defineNitroPlugin(async () => {
  const vaultAddr = process.env.VAULT_ADDR
  const vaultToken = process.env.VAULT_TOKEN
  const isDevMode = process.env.NODE_ENV !== 'production'

  // Development mode: use environment variables or defaults
  if (isDevMode && (!vaultToken || !vaultAddr)) {
    console.log('[vault] Development mode: Using environment variables or defaults')
    
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'postgresql://transcendence:transcendence@localhost:5432/transcendence_db'
    }
    if (!process.env.NUXT_JWT_SECRET) {
      process.env.NUXT_JWT_SECRET = 'dev-jwt-secret-change-in-production'
    }
    if (!process.env.API_KEY) {
      process.env.API_KEY = 'dev-api-key-change-in-production'
    }
    
    console.log('[vault] ✓ Using dev defaults for DATABASE_URL, NUXT_JWT_SECRET, API_KEY')
    return
  }

  // Production mode: require Vault
  if (!vaultToken || !vaultAddr) {
    throw new Error('VAULT_ADDR or VAULT_TOKEN missing')
  }

  async function fetchWithRetry(url: string, maxRetries = 15): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await $fetch<any>(url, {
          headers: { 'X-Vault-Token': vaultToken }
        })
        return response
      } catch (e: any) {
        const status = e?.response?.status || e?.statusCode
        if (status === 404 && i < maxRetries - 1) {
          console.log(`[vault] Secret not ready yet, retry ${i + 1}/${maxRetries}...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        throw e
      }
    }
  }

  console.log('[vault] Fetching DATABASE_URL from Vault...')
  
  const response = await $fetch<any>(
    `${vaultAddr}/v1/secret/data/transcendence/postgres`,
    {
      headers: { 'X-Vault-Token': vaultToken }
    }
  )

  process.env.DATABASE_URL = response.data.data.database_url

  console.log('[vault] ✓ DATABASE_URL loaded successfully')
  
  // JWT .  API key
  const appResponse = await $fetch<any>(
    `${vaultAddr}/v1/secret/data/transcendence/app`,
    { headers: { 'X-Vault-Token': vaultToken } }
  )
  process.env.NUXT_JWT_SECRET = appResponse.data.data.jwt_secret
  process.env.API_KEY = appResponse.data.data.api_key

  console.log('[vault] ✓ All secrets loaded successfully')
})
