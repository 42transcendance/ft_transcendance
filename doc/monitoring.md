# Monitoring module: Prometheus + Grafana

## Major module checklist

| Exigence | Statut | Implémentation |
|---|---|---|
| Set up Prometheus to collect metrics | Fait | Scrape jobs Prometheus/app/node-exporter/postgres-exporter + rules + alertmanager routing |
| Configure exporters and integrations | Fait | Node Exporter, PostgreSQL Exporter, instrumentation app via prom-client, Alertmanager Discord |
| Create custom Grafana dashboards | Fait | Dashboard custom Transcendence Overview provisionne avec panels CPU/RAM/latence/reseau/DB |
| Set up alerting rules | Fait | 5 alertes Prometheus + envoi Discord via Alertmanager |
| Secure access to Grafana | Fait | Grafana derriere Nginx HTTPS + Basic Auth, endpoint metrics public bloque |

Fichiers de reference:
- `monitoring/prometheus/prometheus.yml`
- `monitoring/prometheus/alert_rules.yml`
- `monitoring/grafana/dashboards/transcendence-overview.json`
- `monitoring/alertmanager/alertmanager.yml`
- `security/nginx/nginx.conf`

## Architecture

```
Machine hôte (WSL2)
│
├── /proc, /sys, /net  ← lus par Node Exporter via volume :ro
│
└── Docker network: backend
    ├── node-exporter:9100    (pid: host, /:/host:ro)
    ├── postgres-exporter:9187
    ├── prometheus:9090       ← évalue les règles d'alerte toutes les 15s
    └── alertmanager:9093     ← regroupe et envoie les alertes
    └── app:3000/api/metrics

    Docker network: frontend
    ├── prometheus:9090
    └── grafana:3000          ← accessible via Nginx /grafana/ (HTTPS + basic auth)

Flux d'alertes:
  Prometheus (évaluation) → Alertmanager (regroupement) → Discord Webhook
```

## Services

| Service | Image | Rôle |
|---|---|---|
| Prometheus | prom/prometheus:v2.54.1 | Collecte et stocke les métriques, évalue les règles d'alerte |
| Grafana | grafana/grafana:11.2.2 | Visualisation et dashboards |
| Alertmanager | prom/alertmanager:v0.27.0 | Regroupe les alertes Prometheus et les envoie aux receivers (Discord) |
| Node Exporter | prom/node-exporter:v1.8.2 | Métriques machine hôte (CPU, RAM, réseau, disque) |
| PostgreSQL Exporter | prometheuscommunity/postgres-exporter:v0.16.0 | Métriques PostgreSQL |

> cAdvisor a été retiré: incompatible avec Docker Desktop/WSL2 (échec lecture overlayfs layerdb).

## Node Exporter — position dans l'architecture

Node Exporter tourne comme conteneur Docker mais avec `pid: host` et le volume `/:/host:ro`.
Il lit directement `/proc` et `/sys` de la machine WSL2 hôte — il voit donc les métriques
système globales (pas par conteneur), identiques à ce qu'on aurait sur un serveur Linux bare-metal.

Métriques exposées sur `:9100/metrics`:
- `node_cpu_seconds_total` → temps CPU par mode (idle, user, system...)
- `node_memory_MemAvailable_bytes` / `node_memory_MemTotal_bytes` → RAM disponible/totale
- `node_network_receive_bytes_total` / `node_network_transmit_bytes_total` → débit réseau par interface
- `node_filesystem_*` → occupation disque

## What is monitored (dashboard panels)

| Panel | Source | Métrique |
|---|---|---|
| Active Targets | Prometheus | `up{job!~"prometheus"}` — état UP/DOWN de chaque exporter |
| Host CPU Usage | Node Exporter | `node_cpu_seconds_total{mode="idle"}` |
| App p95 Latency | App (prom-client) | `http_request_duration_seconds` histogram p95 |
| HTTP Request Rate | App (prom-client) | `http_requests_total` par route et méthode |
| Host Memory Usage | Node Exporter | `node_memory_MemAvailable_bytes` |
| Host Network I/O | Node Exporter | `node_network_receive/transmit_bytes_total` sur interface physique |
| PostgreSQL Status | PostgreSQL Exporter | `pg_up` → UP (vert) / DOWN (rouge) |

## Alert rules et notifications

### Règles d'alerte (Prometheus)

| Alerte | Condition | Durée | Sévérité | Action |
|---|---|---|---|---|
| ServiceDown | target `up == 0` | 1 min | 🔴 critical | service indisponible |
| HighNodeCPUUsage | CPU > 85% | 1 min | 🟡 warning | surcharge CPU hôte |
| HighNodeMemoryUsage | RAM > 90% | 1 min | 🟡 warning | mémoire hôte saturée |
| PostgresDown | `pg_up == 0` | 1 min | 🔴 critical | DB indisponible |
| AppHighP95Latency | p95 > 1s | 1 min | 🟡 warning | app lente |

Fichier: `monitoring/prometheus/alert_rules.yml`

### Alertmanager et notifications Discord

Quand une règle se déclenche:

1. **Prometheus** évalue la condition (toutes les 15s)
2. Si condition validée → Prometheus envoie l'alerte à **Alertmanager**
3. **Alertmanager** regroupe les alertes par `alertname`, `cluster`, `service`
4. Après 30s d'attente (`group_wait`), envoie un message Discord via webhook
5. Les alertes résolues (`send_resolved: true`) envoient aussi une notification Discord

Configuration actuelle:
- Alertmanager utilise le receiver natif `discord_configs` (v0.27)
- Aucun template Discord custom n'est requis pour envoyer les notifications

Fichiers:
- `monitoring/alertmanager/alertmanager.yml` — configuration Alertmanager
- `secrets/monitoring.env` — credentials Grafana et Basic Auth Nginx

Le webhook Discord est référencé dans la configuration Alertmanager actuelle. Recommandation production: injecter l'URL via variable d'environnement ou fichier secret plutôt que la laisser en clair.

## Secret management (Vault)

Etat actuel:
- `secrets/monitoring.env` contient les credentials Grafana admin et Basic Auth Nginx.
- Le webhook Discord est configure dans Alertmanager.

Recommandation pour production:
- Ne pas versionner de mots de passe ou de webhook en clair dans le repo.
- Stocker les secrets dans Vault puis les injecter au runtime (entrypoint, template, ou sidecar).
- Faire transiter au minimum ces secrets via Vault:
  - login/mot de passe Grafana admin
  - login/mot de passe Basic Auth Nginx pour `/grafana/`
  - URL du webhook Discord Alertmanager

Approche cible:
1. Ecrire les secrets dans Vault (KV v2), par exemple `secret/monitoring`.
2. Recuperer ces secrets au demarrage des conteneurs (Nginx/Grafana/Alertmanager).
3. Exporter en variables d'environnement uniquement en memoire (pas de fichier committe).
4. Redemarrer les services avec les nouvelles variables.

## Secure access model for Grafana

- Grafana n'est pas exposé sur un port hôte
- Accès uniquement via Nginx HTTPS sur `/grafana/`
- Basic Auth Nginx devant Grafana (credentials dans `secrets/monitoring.env`)
- Anonymous access et sign-up désactivés côté Grafana
- `/api/metrics` bloqué publiquement par Nginx (403) — Prometheus scrape en interne

Credentials: `secrets/monitoring.env` — **changer avant mise en production**

## URLs et accès réseau

| Service | URL / Port hôte | Accessible ? | Remarque |
|---|---|---|---|
| App (HTTPS) | `https://localhost:8443` | ✅ public | via Nginx, TLS 1.2/1.3 |
| App (HTTP) | `http://localhost:8080` | ✅ redirige | 301 → HTTPS automatique |
| Grafana | `https://localhost:8443/grafana/` | ✅ restreint | Basic Auth + HTTPS obligatoire |
| Prometheus | interne uniquement | ❌ non exposé | scrape Docker network uniquement |
| Node Exporter | interne uniquement | ❌ non exposé | `backend` network uniquement |
| PostgreSQL Exporter | interne uniquement | ❌ non exposé | `backend` network uniquement |
| Vault | `http://localhost:8200` | ⚠️ à supprimer | exposé pour dev, supprimer en prod |
| PostgreSQL | `localhost:5432` | ⚠️ à supprimer | exposé pour dev, supprimer en prod |
| `/api/metrics` (app) | `https://localhost:8443/api/metrics` | ❌ bloqué | Nginx retourne 403 |
