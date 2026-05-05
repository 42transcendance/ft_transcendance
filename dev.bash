#!/usr/bin/env bash

# ==============================================================
# ft_transcendence — Dev script (without Docker)
# ==============================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
RESET='\033[0m'

# Configuration
DATABASE_URL="${DATABASE_URL:-postgresql://transcendence:transcendence@localhost:5432/transcendence_db}"
VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-myroot}"
PORT="${PORT:-3000}"

echo -e "${GREEN}================================${RESET}"
echo -e "${GREEN}ft_transcendence - Dev Setup${RESET}"
echo -e "${GREEN}================================${RESET}"
echo ""

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

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

# Check if PostgreSQL is running (optional - can be in Docker)
POSTGRES_OK=false
if ! command_exists psql; then
  echo -e "${YELLOW}⚠ psql not found in PATH${RESET}"
  echo -e "${YELLOW}Continuing... Make sure PostgreSQL is accessible at: $DATABASE_URL${RESET}"
else
  # Try to connect to PostgreSQL
  if psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running${RESET}"
    POSTGRES_OK=true
  else
    echo -e "${YELLOW}⚠ Cannot connect to PostgreSQL at $DATABASE_URL${RESET}"
    echo -e "${YELLOW}This is OK if PostgreSQL is running in Docker or another host${RESET}"
    echo -e "${YELLOW}Continuing anyway... the app will fail if DB is truly inaccessible${RESET}"
  fi
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
