# Monitoring module: Prometheus + Grafana

## Services added

- Prometheus: metric collection and rule evaluation
- Grafana: visualization dashboards
- Node Exporter: host/system metrics
- cAdvisor: container metrics
- PostgreSQL Exporter: database metrics
- App metrics endpoint: custom HTTP metrics from Nuxt/Nitro

## What is monitored

- Availability: all scrape targets via `up`
- App throughput and latency: `http_requests_total`, `http_request_duration_seconds`
- Host CPU and memory usage (Node Exporter)
- Container CPU usage (cAdvisor)
- PostgreSQL health (`pg_up`)

## Alert rules configured

- ServiceDown (critical)
- HighNodeCPUUsage (warning)
- HighNodeMemoryUsage (warning)
- PostgresDown (critical)
- AppHighP95Latency (warning)

Rules file: `monitoring/prometheus/alert_rules.yml`

## Secure access model for Grafana

- Grafana is NOT exposed on a host port
- Access is only through Nginx HTTPS reverse proxy at `/grafana/`
- Additional Nginx Basic Auth is enabled in front of Grafana
- Grafana anonymous access and sign-up are disabled

Credentials file:
- `secrets/monitoring.env`

Change defaults before production.

## URLs

- App: https://localhost:8443/
- Grafana: https://localhost:8443/grafana/
- Prometheus UI is internal-only by default (not published)

## Notes

- Public access to `/api/metrics` through Nginx is blocked (403).
- Prometheus scrapes app metrics over the internal Docker network.
- On non-Linux hosts, Node Exporter and cAdvisor host metrics may require Docker/host-specific adjustments.
