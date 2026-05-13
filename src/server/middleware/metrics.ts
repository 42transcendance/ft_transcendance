import { observeRequest } from '../utils/metrics'

export default defineEventHandler((event) => {
  const startedAt = process.hrtime.bigint()

  event.node.res.once('finish', () => {
    const statusCode = event.node.res.statusCode || 200
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000

    observeRequest(event.method || 'GET', event.path || '/', statusCode, durationSeconds)
  })
})
