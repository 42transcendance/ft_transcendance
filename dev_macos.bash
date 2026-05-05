#!/usr/bin/env bash

# ==============================================================
# ft_transcendence — Dev script (without Docker)
# ==============================================================

make re

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
RESET='\033[0m'

# Configuration
PORT="${PORT:-3000}"

# Detect if we're inside a Docker container
if [ -f /.dockerenv ]; then
  # We're inside a container, use service names
  DB_HOST="${DB_HOST:-postgres}"
  VAULT_HOST="${VAULT_HOST:-vault}"
  IN_DOCKER=1
else
  # We're on the host machine
  DB_HOST="${DB_HOST:-localhost}"
  VAULT_HOST="${VAULT_HOST:-localhost}"
  IN_DOCKER=0
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Docker containers are running (only on host)
if [ "$IN_DOCKER" -eq 0 ]; then
  if command_exists docker; then
    if docker ps 2>/dev/null | grep -q "transcendence_db"; then
      echo -e "${GREEN}✓ PostgreSQL container detected, using localhost (port 5432)${RESET}"
    fi
    if docker ps 2>/dev/null | grep -q "transcendence_vault"; then
      echo -e "${GREEN}✓ Vault container detected, using localhost (port 8200)${RESET}"
    fi
  fi
fi

DATABASE_URL="${DATABASE_URL:-postgresql://transcendence:transcendence@${DB_HOST}:5432/transcendence_db}"
VAULT_ADDR="${VAULT_ADDR:-http://${VAULT_HOST}:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-myroot}"

echo -e "${GREEN}================================${RESET}"
echo -e "${GREEN}ft_transcendence - Dev Setup${RESET}"
echo -e "${GREEN}================================${RESET}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${RESET}"

if ! command_exists node; then
  echo -e "${RED}✗ Node.js not found. Please install Node.js 20+${RESET}"
  exit 1
fi

if ! command_exists npm; then
  echo -e "${RED}✗ npm not found. Please install npm${RESET}"
  exit 1
fi

echo -e "${GREEN}✓ Node $(node --version)${RESET}"
echo -e "${GREEN}✓ npm $(npm --version)${RESET}"


# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL connection...${RESET}"

check_postgres() {
  local url="$1"
  if psql "$url" -c "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running and accessible at $url${RESET}"
    return 0
  fi
  return 1
}

if command_exists psql; then
  # Try localhost first
  if check_postgres "$DATABASE_URL"; then
    :
  else
    # Try host.docker.internal if on Mac/Windows
    ALT_DB_HOST="host.docker.internal"
    ALT_DATABASE_URL="postgresql://transcendence:transcendence@${ALT_DB_HOST}:5432/transcendence_db"
    if check_postgres "$ALT_DATABASE_URL"; then
      echo -e "${YELLOW}PostgreSQL accessible via host.docker.internal (Docker Desktop)${RESET}"
    else
      echo -e "${RED}✗ Cannot connect to PostgreSQL at $DATABASE_URL or $ALT_DATABASE_URL${RESET}"
      if [ "$IN_DOCKER" -eq 0 ] && command_exists docker; then
        echo -e "${YELLOW}PostgreSQL container is running mais pas accessible via localhost ni host.docker.internal${RESET}"
        echo -e "${YELLOW}Essayez : docker compose restart postgres${RESET}"
        echo -e "${YELLOW}Ou vérifiez que rien n'occupe le port 5432 sur votre machine${RESET}"
      else
        echo -e "${YELLOW}Make sure PostgreSQL is running and accessible${RESET}"
      fi
      exit 1
    fi
  fi
else
  echo -e "${YELLOW}⚠ psql not found, skipping connection check${RESET}"
  echo -e "${YELLOW}Make sure PostgreSQL is accessible at: $DATABASE_URL${RESET}"
fi

echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${RESET}"
cd src
if [ ! -d "node_modules" ]; then
  npm install
else
  echo -e "${GREEN}✓ Dependencies already installed${RESET}"
fi

echo ""

# Set environment variables
echo -e "${YELLOW}Setting up environment variables...${RESET}"
export NODE_ENV="${NODE_ENV:-development}"
export DATABASE_URL
export VAULT_ADDR
export VAULT_TOKEN
export PORT
export NUXT_JWT_SECRET="${NUXT_JWT_SECRET:-dev-jwt-secret-change-in-production}"
export API_KEY="${API_KEY:-dev-api-key-change-in-production}"

echo -e "${GREEN}✓ NODE_ENV=$NODE_ENV${RESET}"
echo -e "${GREEN}✓ DATABASE_URL=$DATABASE_URL${RESET}"
echo -e "${GREEN}✓ PORT=$PORT${RESET}"
echo -e "${YELLOW}⚠ Using development secrets (change for production)${RESET}"

echo ""

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${RESET}"
npx prisma generate

echo ""

# Run Prisma migrations
echo -e "${YELLOW}Running Prisma migrations...${RESET}"
npx prisma migrate deploy 2>/dev/null || {
  echo -e "${YELLOW}No migrations to deploy. Running initial migration...${RESET}"
  npx prisma migrate dev --name init --skip-generate || true
}

echo ""

# Create uploads storage directory
echo -e "${YELLOW}Creating storage directory...${RESET}"
mkdir -p ../uploads_storage
echo -e "${GREEN}✓ Storage directory ready${RESET}"

echo ""

# Start development server
echo -e "${GREEN}Starting development server...${RESET}"
echo -e "${GREEN}================================${RESET}"
echo -e "${GREEN}App running at http://localhost:$PORT${RESET}"
echo -e "${GREEN}================================${RESET}"
echo ""

npm run dev
