import { getMetricsRegistry } from '../utils/metrics'

export default defineEventHandler(async (event) => {
  const register = getMetricsRegistry()

  setHeader(event, 'Content-Type', register.contentType)

  return await register.metrics()
})
