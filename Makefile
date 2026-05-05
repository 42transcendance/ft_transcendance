# ==============================================================
# ft_transcendence — Makefile
# ==============================================================

COMPOSE		= docker compose
APP			= app
DB			= postgres
DB_USER 	= transcendence
DB_NAME 	= transcendence_db

# ==============================================================
# COULEURS
# ==============================================================
GREEN		= \033[0;32m
YELLOW		= \033[0;33m
RED			= \033[0;31m
RESET		= \033[0m

# ==============================================================
# PRINCIPAL
# ==============================================================

all: up migrate-prod

up:
	@echo "$(GREEN)Starting services...$(RESET)"
	$(COMPOSE) up --build -d
	mkdir -p uploads_storage

down:
	@echo "$(YELLOW)Stopping services...$(RESET)"
	$(COMPOSE) down

restart: down up migrate-dev

logs:
	$(COMPOSE) logs -f

logs-app:
	$(COMPOSE) logs -f $(APP)

logs-db:
	$(COMPOSE) logs -f $(DB)

# ==============================================================
# BUILD
# ==============================================================

build:
	@echo "$(GREEN)Building images...$(RESET)"
	$(COMPOSE) build --no-cache

rebuild: down build up

# ==============================================================
# DEVELOPMENT
# ==============================================================

backend-up:
	@$(COMPOSE) up -d postgres vault
	@for i in {1..60}; do \
		if $(COMPOSE) exec -T postgres pg_isready -U transcendence -d transcendence_db > /dev/null 2>&1 && \
		   curl -s -H "X-Vault-Token: myroot" http://localhost:8200/v1/sys/health > /dev/null 2>&1; then \
			echo "$(GREEN)✓ Backend ready$(RESET)"; \
			exit 0; \
		fi; \
		sleep 1; \
	done; \
	echo "$(RED)✗ Services timeout$(RESET)"; \
	exit 1

backend-down:
	@$(COMPOSE) stop postgres vault > /dev/null
	@echo "$(YELLOW)✓ Backend stopped$(RESET)"

vault-init-local:
	@for i in {1..30}; do \
		if $(COMPOSE) exec -T postgres pg_isready -U transcendence -d transcendence_db > /dev/null 2>&1; then break; fi; \
		sleep 1; \
	done
	@curl -s -X POST \
		-H "X-Vault-Token: myroot" \
		-H "Content-Type: application/json" \
		-d '{"data": {"user": "transcendence", "password": "transcendence", "db": "transcendence_db", "database_url": "postgresql://transcendence:transcendence@localhost:5432/transcendence_db"}}' \
		http://localhost:8200/v1/secret/data/transcendence/postgres > /dev/null && \
	echo "$(GREEN)✓ Vault ready$(RESET)" || true

dev: backend-up vault-init-local
	@VAULT_RESPONSE=$$(curl -s -H "X-Vault-Token: myroot" http://localhost:8200/v1/secret/data/transcendence/postgres); \
	DATABASE_URL=$$(echo "$$VAULT_RESPONSE" | jq -r ".data.data.database_url"); \
	if [ -z "$$DATABASE_URL" ] || [ "$$DATABASE_URL" = "null" ]; then \
		echo "$(RED)✗ Vault error$(RESET)"; exit 1; \
	fi; \
	APP_RESPONSE=$$(curl -s -H "X-Vault-Token: myroot" http://localhost:8200/v1/secret/data/transcendence/app); \
	JWT_SECRET=$$(echo "$$APP_RESPONSE" | jq -r ".data.data.jwt_secret"); \
	API_KEY=$$(echo "$$APP_RESPONSE" | jq -r ".data.data.api_key"); \
	cd src && \
	export DATABASE_URL="$$DATABASE_URL" VAULT_ADDR="http://localhost:8200" VAULT_TOKEN="myroot" NUXT_JWT_SECRET="$$JWT_SECRET" API_KEY="$$API_KEY" && \
	npx prisma db push --skip-generate && \
	npm run dev

# ==============================================================
# PRISMA
# ==============================================================

migrate-prod:
	@for i in {1..60}; do \
		if $(COMPOSE) ps $(APP) 2>/dev/null | grep -q "Up"; then break; fi; \
		sleep 2; \
	done
	@$(COMPOSE) exec -T $(APP) sh -c 'DB_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url"); export DATABASE_URL=$${DB_URL//localhost/postgres} && ./node_modules/.bin/prisma migrate deploy' && echo "$(GREEN)✓ DB migrated$(RESET)"

# Variable qui récupère DATABASE_URL depuis Vault
migrate-dev:
	docker compose exec app sh -c 'DB_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url"); export DATABASE_URL=$${DB_URL//localhost/postgres} && ./node_modules/.bin/prisma migrate dev --name init'

migrate:
	@echo "$(GREEN)Running migrations...$(RESET)"
	docker compose exec app sh -c 'DB_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url"); export DATABASE_URL=$${DB_URL//localhost/postgres} && ./node_modules/.bin/prisma migrate deploy'

generate:
	@echo "$(GREEN)Generating Prisma client...$(RESET)"
	docker compose exec app sh -c 'DB_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url"); export DATABASE_URL=$${DB_URL//localhost/postgres} && ./node_modules/.bin/prisma generate'

studio:
	@echo "$(GREEN)Opening Prisma Studio on http://localhost:5555$(RESET)"
	docker compose exec app sh -c 'DB_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url"); export DATABASE_URL=$${DB_URL//localhost/postgres} && ./node_modules/.bin/prisma studio'

# ==============================================================
# BASE DE DONNÉES
# ==============================================================
db-shell:
	@echo "$(GREEN)Connecting to PostgreSQL...$(RESET)"
	$(COMPOSE) exec $(DB) psql -U $(DB_USER) -d $(DB_NAME)

db-reset:
	@echo "$(RED)Resetting database...$(RESET)"
	docker compose exec app sh -c 'DB_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url"); export DATABASE_URL=$${DB_URL//localhost/postgres} && ./node_modules/.bin/prisma migrate reset --force'
db-reset-and-migrate:
	docker compose exec app sh -c 'DB_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url"); export DATABASE_URL=$${DB_URL//localhost/postgres} && ./node_modules/.bin/prisma migrate reset --force && ./node_modules/.bin/prisma migrate dev --name init'

# ==============================================================
# STATUT / SANTÉ
# ==============================================================

status:
	$(COMPOSE) ps

health:
	@echo "$(GREEN)Checking app health...$(RESET)"
	@curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || \
		echo "$(RED)Service not responding$(RESET)"

# ==============================================================
# NETTOYAGE
# ==============================================================

clean: down
	@echo "$(YELLOW)Removing containers and images...$(RESET)"
	$(COMPOSE) down --rmi local

fclean: down
	@echo "$(RED)Full clean — removing everything including volumes...$(RESET)"
	$(COMPOSE) down --rmi local -v --remove-orphans
	docker network prune -f
	rm -rf ./uploads_storage
	

re: clean up migrate

# ==============================================================
# AIDE
# ==============================================================

help:
	@echo ""
	@echo "$(GREEN)ft_transcendence — database service$(RESET)"
	@echo ""
	@echo "  $(YELLOW)make$(RESET)              → lance les services (production)"
	@echo "  $(YELLOW)make dev$(RESET)          → lance backend + npm run dev (développement)"
	@echo "  $(YELLOW)make backend-up$(RESET)   → lance juste postgres + vault"
	@echo "  $(YELLOW)make backend-down$(RESET) → arrête postgres + vault"
	@echo "  $(YELLOW)make down$(RESET)         → stoppe tous les services"
	@echo "  $(YELLOW)make restart$(RESET)      → redémarre tout"
	@echo "  $(YELLOW)make logs$(RESET)         → affiche tous les logs"
	@echo "  $(YELLOW)make logs-app$(RESET)     → logs du serveur Node"
	@echo "  $(YELLOW)make logs-db$(RESET)      → logs de PostgreSQL"
	@echo ""
	@echo "  $(YELLOW)make migrate$(RESET)      → applique les migrations"
	@echo "  $(YELLOW)make migrate-dev$(RESET)  → crée une nouvelle migration"
	@echo "  $(YELLOW)make studio$(RESET)       → ouvre Prisma Studio (port 5555)"
	@echo "  $(YELLOW)make db-shell$(RESET)     → ouvre un shell psql"
	@echo "  $(YELLOW)make db-reset$(RESET)     → remet la DB à zéro"
	@echo ""
	@echo "  $(YELLOW)make status$(RESET)       → état des containers"
	@echo "  $(YELLOW)make health$(RESET)       → vérifie le healthcheck"
	@echo ""
	@echo "  $(YELLOW)make clean$(RESET)        → supprime containers + images"
	@echo "  $(YELLOW)make fclean$(RESET)       → supprime tout + volumes"
	@echo "  $(YELLOW)make re$(RESET)           → fclean + up"
	@echo ""

.PHONY: all up down restart logs logs-app logs-db build rebuild \
        migrate migrate-dev migrate-prod generate studio db-shell db-reset \
        status health clean fclean re help dev backend-up backend-down vault-init-local
