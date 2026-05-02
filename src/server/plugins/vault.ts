export default defineNitroPlugin(async () => {
  const vaultAddr = process.env.VAULT_ADDR
  const vaultToken = process.env.VAULT_TOKEN

  if (!vaultToken || !vaultAddr) {
    throw new Error('VAULT_ADDR or VAULT_TOKEN missing')
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
  process.env.JWT_SECRET = appResponse.data.data.jwt_secret
  process.env.API_KEY = appResponse.data.data.api_key

  console.log('[vault] ✓ All secrets loaded successfully')
})