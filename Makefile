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

all: up migrate-dev

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
# PRISMA
# ==============================================================

# Variable qui récupère DATABASE_URL depuis Vault
migrate-dev:
	docker compose exec app sh -c 'export DATABASE_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url") && ./node_modules/.bin/prisma migrate dev --name init'

migrate:
	@echo "$(GREEN)Running migrations...$(RESET)"
	docker compose exec app sh -c 'export DATABASE_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url") && ./node_modules/.bin/prisma migrate deploy'

generate:
	@echo "$(GREEN)Generating Prisma client...$(RESET)"
	docker compose exec app sh -c 'export DATABASE_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url") && ./node_modules/.bin/prisma generate'

studio:
	@echo "$(GREEN)Opening Prisma Studio on http://localhost:5555$(RESET)"
	docker compose exec app sh -c 'export DATABASE_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url") && ./node_modules/.bin/prisma studio'

# ==============================================================
# BASE DE DONNÉES
# ==============================================================
db-shell:
	@echo "$(GREEN)Connecting to PostgreSQL...$(RESET)"
	$(COMPOSE) exec $(DB) psql -U $(DB_USER) -d $(DB_NAME)

db-reset:
	@echo "$(RED)Resetting database...$(RESET)"
	docker compose exec app sh -c 'export DATABASE_URL=$$(curl -s -H "X-Vault-Token: myroot" http://vault:8200/v1/secret/data/transcendence/postgres | jq -r ".data.data.database_url") && ./node_modules/.bin/prisma migrate reset --force'
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
	rm -rf ./uploads_storage/*
	

re: fclean up migrate-dev

# ==============================================================
# AIDE
# ==============================================================

help:
	@echo ""
	@echo "$(GREEN)ft_transcendence — database service$(RESET)"
	@echo ""
	@echo "  $(YELLOW)make$(RESET)              → lance les services"
	@echo "  $(YELLOW)make down$(RESET)          → stoppe les services"
	@echo "  $(YELLOW)make restart$(RESET)       → redémarre tout"
	@echo "  $(YELLOW)make logs$(RESET)          → affiche tous les logs"
	@echo "  $(YELLOW)make logs-app$(RESET)      → logs du serveur Node"
	@echo "  $(YELLOW)make logs-db$(RESET)       → logs de PostgreSQL"
	@echo ""
	@echo "  $(YELLOW)make migrate$(RESET)       → applique les migrations"
	@echo "  $(YELLOW)make migrate-dev$(RESET)   → crée une nouvelle migration"
	@echo "  $(YELLOW)make studio$(RESET)        → ouvre Prisma Studio (port 5555)"
	@echo "  $(YELLOW)make db-shell$(RESET)      → ouvre un shell psql"
	@echo "  $(YELLOW)make db-reset$(RESET)      → remet la DB à zéro"
	@echo ""
	@echo "  $(YELLOW)make status$(RESET)        → état des containers"
	@echo "  $(YELLOW)make health$(RESET)        → vérifie le healthcheck"
	@echo ""
	@echo "  $(YELLOW)make clean$(RESET)         → supprime containers + images"
	@echo "  $(YELLOW)make fclean$(RESET)        → supprime tout + volumes"
	@echo "  $(YELLOW)make re$(RESET)            → fclean + up"
	@echo ""

.PHONY: all up down restart logs logs-app logs-db build rebuild \
        migrate migrate-dev generate studio db-shell db-reset \
        status health clean fclean re help
