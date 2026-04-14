# Copilot Instructions — ft_transcendance (42 Inception)

## Project Overview

This is a **42 School Inception project**: a multi-service Docker infrastructure running WordPress with NGINX, MariaDB, and Redis, plus a full monitoring stack (Prometheus → Alertmanager → Discord) and a static portfolio site. All services are orchestrated via Docker Compose and managed through a root `Makefile`.

## Architecture

```
Internet → :8443 (HTTPS/TLS1.2+)
             └─ nginx ──(fastcgi:9000)──► wordpress ──(3306)──► mariadb
                                              └──(6379)──► redis (object cache)

Monitoring:  cadvisor ──► prometheus ──► alertmanager ──► discord-alertmanager ──► Discord webhook
                              └──► grafana (:3000)

Static site: :8080 (HTTP) ──► static-site (nginx serving HTML/CSS portfolio)
```

- **Single bridge network** `ft_transcendance` — all inter-service communication uses container names as hostnames (e.g., `mariadb`, `wordpress`, `redis`, `alertmanager`).
- **All custom images** are built from `debian:bookworm` — no pre-built Docker Hub images for core services (42 project constraint). Monitoring services (prometheus, alertmanager, cadvisor) use official images.
- **Secrets** are Docker secrets read from `secrets/*.txt` at runtime via `/run/secrets/` — never embed passwords in Dockerfiles or `.env`.
- **Volumes** bind-mount to `/home/dbhujoo/data/{mariadb,wordpress,grafana}` — the `make up` target creates these directories.

## Key Files & Conventions

| Path | Purpose |
|---|---|
| `Makefile` | All build/run commands — always use `make` targets, never raw `docker compose` |
| `srcs/docker_compose.yml` | Service definitions, networks, volumes, secrets |
| `srcs/.env` | Non-secret env vars (DB names, usernames, URLs) |
| `secrets/` | Docker secrets (passwords, webhook URLs) — **never commit real values** |
| `srcs/requirements/<service>/` | Each service has `Dockerfile`, `conf/`, and optionally `tools/script.sh` |

### Dockerfile patterns
- Single `RUN` with chained `&&` to minimize layers (see comment in nginx Dockerfile).
- Entrypoints are shell scripts in `tools/script.sh` that read secrets, wait for dependencies, then `exec` the main process as PID 1.
- PHP-FPM listens on port `9000`; NGINX proxies via `fastcgi_pass wordpress:9000`.

### Init scripts are idempotent
Both `mariadb/tools/script.sh` and `wordpress/tools/script.sh` use `IF NOT EXISTS` / `is-installed` checks so containers can restart safely without corrupting state.

## Developer Workflows

```bash
make          # Build all images and start containers (detached)
make down     # Stop and remove containers
make re       # Rebuild from scratch (down + up)
make clean    # down + prune all Docker artifacts
make fclean   # clean + wipe persistent volume data (requires sudo)
make logs     # Tail all container logs
make status   # docker ps
```

## Service Ports

| Port | Service |
|---|---|
| 8443 | NGINX (HTTPS → WordPress) |
| 8080 | Static portfolio site |
| 3000 | Grafana |
| 9090 | Prometheus |
| 9093 | Alertmanager |
| 8081 | cAdvisor |

## When Modifying This Project

- **Adding a new service**: add Dockerfile under `srcs/requirements/bonus/<name>/`, add service block in `docker_compose.yml` on network `ft_transcendance`, and add volume bind-mount path to both the compose file and the `make up` mkdir list.
- **Changing a config file**: configs are `COPY`-ed at build time — you must rebuild (`make re`) for changes to take effect. Only Prometheus/Alertmanager configs are bind-mounted (hot-reloadable).
- **Secrets**: add new secret files to `secrets/`, declare in `docker_compose.yml` `secrets:` section, reference in the service's `secrets:` list, then read via `cat /run/secrets/<name>` in entrypoint scripts.
- **Monitoring alerts**: edit `srcs/requirements/bonus/prometheus/alerts.rules.yml` (PromQL). Alert routing is in `alertmanager/alertmanager.yml` → forwards to Discord via `discord-alertmanager` sidecar.
- **Comments are in French** — maintain this convention for consistency with existing codebase.
