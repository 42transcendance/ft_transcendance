import client from 'prom-client'

const register = new client.Registry()

client.collectDefaultMetrics({
  register,
  prefix: 'app_'
})

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests handled by the application',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [register]
})

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  registers: [register]
})

const normalizeRoute = (path: string): string => {
  const withoutQuery = path.split('?')[0] || '/'

  return withoutQuery
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
      ':uuid'
    )
    .replace(/\b\d+\b/g, ':id')
}

export const observeRequest = (
  method: string,
  route: string,
  statusCode: number,
  durationSeconds: number
): void => {
  const labels = {
    method,
    route: normalizeRoute(route),
    status_code: String(statusCode)
  }

  httpRequestsTotal.inc(labels)
  httpRequestDurationSeconds.observe(labels, durationSeconds)
}

export const getMetricsRegistry = (): client.Registry => register
