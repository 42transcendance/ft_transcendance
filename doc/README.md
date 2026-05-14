*This project has been created as part of the 42 curriculum by dbhujoo, ocgraf, nbacconn, ebenoist, tcros.*

# ft_transcendance

## Description

**ft_transcendance** is a multiplayer web platform built around a custom game named Pixel Fight. The project combines a modern frontend, a real-time game layer, a relational database, authentication, social features, and a hardened DevOps stack.

### Key features

- User authentication and profile management
- Friends system, chat, and presence tracking
- Real-time multiplayer game sessions
- Responsive Nuxt 3 frontend with SSR
- PostgreSQL database with Prisma ORM
- Security layer with Nginx, ModSecurity, and Vault
- Monitoring stack with Prometheus, Grafana, Alertmanager, Node Exporter, and PostgreSQL Exporter

## Team Information

| Role | Person(s) | Key responsibilities |
|---|---|---|
| Product Owner | tcros | Product vision, backlog prioritization, feature validation, evaluator-facing contact |
| Project Manager | ocgraf | Team coordination, deadline tracking, blocker management |
| Technical Lead | ebenoist, dbhujoo | Technical architecture, stack decisions, critical code reviews |
| Dev Lead | nbacconn | Cross-feature implementation leadership and ownership of development scope |
| Developers | All team members | Implementation, testing, documentation |

## Project Management

The work was split by module ownership and feature area, with each member covering a clearly identified part of the stack. Integration happened through shared branches and incremental merges, so each service could be validated independently before being assembled in the full compose stack.

### Organization

- Tasks were distributed by domain: frontend, realtime, security, database, monitoring, and game logic.
- Modules were tracked in `doc/modules.md` and used as the basis for the points/ownership breakdown.
- The stack was validated service by service, then as a full environment.
- The team held two weekly meetings with written reports (comptes rendus) to track decisions, progress, and next actions.

### Tools used

- Git / GitHub for version control and coordination
- Podman / Podman Compose for local container execution
- Makefile for launch, migration, and maintenance commands
- Prisma for schema management and migrations

### Communication

- Discord for day-to-day coordination and quick validation checks
- Shared discussions around implementation choices and integration issues

## Technical Stack

### Frontend

- **Nuxt 3** for the application framework
- **Vue 3** for component-based UI
- **TypeScript** for typed application code
- SSR enabled for better rendering and routing behavior

### Backend

- **Nitro / Nuxt server routes** for API endpoints
- **WebSockets** for realtime gameplay and chat flows
- **Prisma Client** for database access
- **Vault** for secret management

### Database

- **PostgreSQL** was chosen because the project needs structured relational data with strong consistency: users, friendships, and global chat messages.
- **Prisma** provides type-safe access, migrations, and a clean schema layer.

### Infrastructure / DevOps

- **Podman** for container execution
- **Nginx** as reverse proxy and HTTPS entry point
- **ModSecurity + OWASP CRS** as WAF layer
- **Prometheus** for metrics collection
- **Grafana** for dashboards
- **Alertmanager** for alert routing
- **Node Exporter** and **Postgres Exporter** for host and database metrics

## Architecture

```text
+--------------------------------------------------------------+
|                       WAF (ModSecurity)                       |
|                 HTTPS termination + OWASP CRS                 |
+--------------------------------------------------------------+
										|
										v
+--------------------------------------------------------------+
|                        API Gateway / Nginx                    |
|            Reverse proxy, WebSocket, TLS, access control     |
+--------------------------------------------------------------+
					  |                         |                    |
					  v                         v                    v
+---------------------------+   +------------------------+   +-------------------+
|        App Nuxt 3         |   |        Grafana        |   |       Vault       |
|    Frontend + API routes  |   |   Monitoring dashboard |   |   Secrets store   |
+---------------------------+   +------------------------+   +-------------------+
					  |
					  v
+---------------------------+   +------------------------+
|      PostgreSQL DB        |   |   Monitoring Stack     |
|   Users, chat, games...   |   | Prometheus, Alertman.  |
+---------------------------+   | Node Exporter, PG Exp. |
										  +------------------------+

Prometheus scrape targets:
  - App /api/metrics
  - PostgreSQL Exporter
  - Node Exporter
  - Prometheus self-metrics
```

## Database Schema

The database schema is defined in `src/prisma/schema.prisma`.

### Main tables and relations

| Table | Purpose | Key fields / notes |
|---|---|---|
| `User` | Main user account entity | `id`, `email`, `username`, `password`, `avatarUrl`, `isOnline`, `lastSeenAt` |
| `Friendship` | Friend requests and relations | `senderId`, `receiverId`, `status` (`PENDING`, `ACCEPTED`, `DECLINED`) |
| `GlobalMessage` | Global chat messages | `content`, `senderUsername`, `createdAt` |

### Relationship summary

- One user can send and receive many friendships.
- A user can author many global chat messages.

## Features List

| Feature | Main contributor(s) | Description |
|---|---|---|
| Authentication | nbacconn, dbhujoo | Sign-up, login, logout, and token-based session handling |
| User profile management | nbacconn, dbhujoo | Profile viewing, updates, avatar upload, and account data |
| Friends system | nbacconn | Send, accept, reject, and remove friend relationships |
| Chat | nbacconn, ebenoist | Global chat history and real-time message exchange |
| Realtime gameplay | tcros, nbacconn | Match session handling and WebSocket-based game interactions |
| Frontend UI / SSR | ocgraf, nbacconn | Application layout, component structure, and server-side rendering |
| Security layer | ebenoist | WAF / ModSecurity and Vault-backed secret handling |
| Monitoring | dbhujoo | Prometheus, Grafana, exporters, and alerting stack |
| Dockerization & orchestration | dbhujoo | Container setup (Dockerfile/compose compatibility), service wiring, secrets/env integration, and runtime tooling for the full stack |

## Modules

Points are calculated as required: **Major = 2 pts**, **Minor = 1 pt**.

### Core Modules

| # | Type | Module | Owner(s) | Pts | Why it was chosen / implementation |
|---|---|---|---|---|---|
| 1 | Major | Framework frontend & backend | ocgraf, nbacconn | 2 | Nuxt 3 provides the frontend and server-side API surface used by the project |
| 2 | Major | Real-time features (WebSockets) | nbacconn, tcros | 2 | Needed for live chat and gameplay synchronization |
| 3 | Major | User interaction | nbacconn, ebenoist, dbhujoo | 2 | Covers the social interactions of the app: auth, profile, friends, chat |
| 4 | Minor | ORM for database | dbhujoo | 1 | Prisma is used for type-safe database access and migrations |
| 5 | Minor | Server-Side Rendering (SSR) | ocgraf, nbacconn | 1 | SSR improves initial rendering and matches the Nuxt architecture |
| 8 | Major | User management & authentication | nbacconn, dbhujoo | 2 | Accounts, login, logout, auth checks, and protected routes |
| 9 | Major | WAF/ModSecurity + HashiCorp Vault | ebenoist | 2 | Security layer for request inspection and secret management |
| 10 | Major | Web-based game (PvP) | tcros | 2 | Core gameplay loop and real-time match behavior |

### Bonus Modules

| # | Type | Module | Owner(s) | Pts | Why it was chosen / implementation |
|---|---|---|---|---|---|
| 6 | Minor | Design system (10+ components) | ocgraf | 1 | Custom component library and reusable UI structure |
| 7 | Minor | Additional browser support | ocgraf | 1 | Ensures the app remains usable across browsers |
| 11 | Major | Remote players (real-time) | tcros, nbacconn | 2 | Multiplayer synchronization across clients |
| 12 | Major | Advanced 3D graphics (Three.js / Babylon.js) | ocgraf | 2 | Visual/game rendering layer with 3D-oriented architecture |
| 13 | Major | Prometheus & Grafana monitoring | dbhujoo | 2 | Observability stack for metrics, dashboards, and alerts |

### Module Totals

| Category | Count | Pts each | Subtotal |
|---|---|---|---|
| Major | 9 | 2 | 18 |
| Minor | 4 | 1 | 4 |
| **Total** | **13** |  | **22** |

## Individual Contributions

### dbhujoo

- Designed the Prisma schema and PostgreSQL integration
- Set up the monitoring stack and metrics endpoints
- Worked on deployment-related scripts and documentation
- Helped with authentication and user-management flows
- Performed technical watch and reviewed merge requests to keep implementation quality consistent

### ocgraf

- Built the Nuxt 3 frontend structure
- Worked on SSR and browser-facing rendering
- Created and maintained reusable UI components
- Covered design system and cross-browser support

### nbacconn

- Implemented realtime application flows
- Contributed to authentication, user interaction, and social features
- Worked on WebSocket-driven behavior for chat and gameplay

### ebenoist

- Implemented the security layer around the stack
- Set up ModSecurity / WAF behavior and Vault-oriented secret handling
- Contributed to hardening and access-control related work

### tcros

- Implemented the game logic and multiplayer behavior
- Worked on real-time gameplay synchronization
- Contributed to player-session and match-related features
- Implemented client-side rendering

## Instructions

### Prerequisites

Install the following tools before running the project:

- **Podman**
- **podman-compose** or a Podman setup compatible with `docker compose`
- **Node.js** and **npm**
- **Make**
- **Git**
- **jq**
- **curl**

Recommended versions:

- Node.js 20+ is a safe baseline
- A recent Podman release with rootless support

### Configuration

Make sure these files exist and are filled in:

- `./.env` for Prisma / database access
- `./secrets/postgres.env` for PostgreSQL credentials
- `./secrets/monitoring.env` for Grafana and monitoring credentials

### Run the project

1. Clone the repository.
2. Install the frontend dependencies if needed:
	```bash
	cd src
	npm install
	```
3. Start the stack with Podman:
	```bash
	make up-goinfre
	```
	If your Podman setup already works with the regular compose flow, `make up` also works.
4. Open the application:
	- App: `https://localhost:8443`
	- Grafana: `https://localhost:9443`

### Useful commands

#### General

- `make down` to stop the stack
- `make logs` to follow all containers
- `make logs-monitoring` to inspect Prometheus / Grafana / exporters
- `make health` to check the app health endpoint

#### Database

- `make migrate` to apply Prisma migrations
- `make migrate-dev` to create a new migration
- `make db-shell` to access the PostgreSQL shell
- `make db-reset` to reset the database to initial state
- `make db-reset-and-migrate` to reset and run migrations
- `make studio` to open Prisma Studio (visual database explorer)
- `make generate` to regenerate the Prisma client

**SQL queries for exploration** (run inside `make db-shell`):

```sql
-- List all tables
\dt

-- Show table schema (replace TABLE_NAME with actual name)
\d TABLE_NAME

-- Count records in each table
SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables;

-- View all users
SELECT id, username, email, "isOnline", "lastSeenAt" FROM "User";

-- View all friendships
SELECT * FROM "Friendship";

-- View global messages
SELECT * FROM "GlobalMessage" ORDER BY "createdAt" DESC LIMIT 10;


## Resources

### Classic references

- [Nuxt 3 documentation](https://nuxt.com/docs)
- [Prisma documentation](https://www.prisma.io/docs/)
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [Podman documentation](https://podman.io/docs)
- [Nginx documentation](https://nginx.org/en/docs/)
- [ModSecurity documentation](https://github.com/owasp-modsecurity/ModSecurity)
- [Prometheus documentation](https://prometheus.io/docs/introduction/overview/)
- [Grafana documentation](https://grafana.com/docs/grafana/latest/)
- [Vault documentation](https://developer.hashicorp.com/vault/docs)

### AI usage :

AI was used to help restructure the README, rewrite the architecture section, consolidate the requirements into a cleaner project document, and format the module and contribution summaries. The technical details were cross-checked against the repository files such as `docker-compose.yml`, `src/prisma/schema.prisma`, `doc/modules.md`, and the monitoring documentation.

## Additional notes

- More detailed database and monitoring notes are available in `doc/README.md` and `doc/monitoring.md`.
- The module breakdown and points are documented in `doc/modules.md`.
- The project is intended to run with Podman rather than Docker.

## Attack tests (should return HTTP 403)

### SQL Injection

```bash
curl -k -i -G "https://localhost:8443/" --data-urlencode "q=admin' OR '1'='1"
curl -k -i -G "https://localhost:8443/" --data-urlencode "q=1' UNION SELECT password FROM users--"
curl -k -i -G "https://localhost:8443/" --data-urlencode "q='; DROP TABLE users--"
```

### XSS (Cross-Site Scripting)

```bash
curl -k -i -G "https://localhost:8443/" --data-urlencode "q=<script>alert('XSS')</script>"
curl -k -i -G "https://localhost:8443/" --data-urlencode "q=<img src=x onerror=alert(1)>"
curl -k -i -G "https://localhost:8443/" --data-urlencode "q=javascript:alert(document.cookie)"
```

### Command Injection (RCE)

```bash
curl -k -i -G "https://localhost:8443/" --data-urlencode "cmd=;cat /etc/passwd"
curl -k -i -G "https://localhost:8443/" --data-urlencode "cmd=| ls -la"
```

### Path Traversal

```bash
curl -k -i "https://localhost:8443/?file=..%2F..%2F..%2Fetc%2Fpasswd"
```

### Scanner Detection

```bash
curl -k -i -A "sqlmap/1.6.12" https://localhost:8443/
curl -k -i -A "Nikto/2.1.6" https://localhost:8443/
```

## Legitimate traffic tests (should return HTTP 200)

```bash
curl -k -i https://localhost:8443/
curl -k -i https://localhost:8443/login
curl -k -i https://localhost:8443/health
```