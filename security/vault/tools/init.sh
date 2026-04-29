#!/bin/sh
set -e

export VAULT_ADDR='http://127.0.0.1:8200'

echo "Attente de Vault..."
sleep 3

# Vérifie si déjà initialisé
INITIALIZED=$(vault status -format=json 2>/dev/null | grep '"initialized"' | grep -c 'true' || true)

if [ "$INITIALIZED" = "0" ]; then
    echo "Initialisation de Vault..."
    vault operator init -key-shares=1 -key-threshold=1 -format=json > /vault/data/init.json

    UNSEAL_KEY=$(cat /vault/data/init.json | grep '"unseal_keys_b64"' -A1 | tail -1 | tr -d '", ')
    ROOT_TOKEN=$(cat /vault/data/init.json | grep '"root_token"' | cut -d'"' -f4)

    vault operator unseal "$UNSEAL_KEY"
    vault login "$ROOT_TOKEN"
    vault secrets enable -path=secret kv

    . /secrets/postgres.env
    vault kv put secret/transcendence/postgres \
        user="$POSTGRES_USER" \
        password="$POSTGRES_PASSWORD" \
        db="$POSTGRES_DB" \
        database_url="$DATABASE_URL"

    vault kv put secret/transcendence/app \
        jwt_secret="$(openssl rand -hex 32)" \
        api_key="$(openssl rand -hex 16)"

    echo "Vault initialisé — secrets stockés"
else
    echo "Vault déjà initialisé, unseal en cours..."
    UNSEAL_KEY=$(cat /vault/data/init.json | grep '"unseal_keys_b64"' -A1 | tail -1 | tr -d '", ')
    vault operator unseal "$UNSEAL_KEY"
    echo "Vault déverrouillé"
fi