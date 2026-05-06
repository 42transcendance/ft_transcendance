#!/bin/sh
set -e

export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='myroot'

sleep 2

. /secrets/postgres.env
vault kv put secret/transcendence/postgres \
    user="$POSTGRES_USER" \
    password="$POSTGRES_PASSWORD" \
    db="$POSTGRES_DB" \
    database_url="$DATABASE_URL"


vault kv put secret/transcendence/app \
    jwt_secret="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')" \
    api_key="$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')"

echo "Secrets stored in Vault"