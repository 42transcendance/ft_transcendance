#!/bin/sh

export VAULT_ADDR='http://127.0.0.1:8200'

# Attendre que Vault soit accessible
echo "Waiting for Vault to start..."
sleep 8

# Déverrouiller
UNSEAL_KEY=$(cat /run/secrets/vault_unseal_key)
ROOT_TOKEN=$(cat /run/secrets/vault_root_token)

vault operator unseal $UNSEAL_KEY
export VAULT_TOKEN=$ROOT_TOKEN

# Vérifier si déjà initialisé
if vault kv get secret/transcendence/mariadb 2>/dev/null; then
    echo "Secrets already stored, skipping..."
    exit 0
fi

# Activer KV et stocker les secrets
vault secrets enable -path=secret kv-v2

vault kv put secret/transcendence/mariadb \
    MYSQL_PASSWORD=$(cat /run/secrets/db_password) \
    MYSQL_ROOT_PASSWORD=$(cat /run/secrets/db_root_password)

vault kv put secret/transcendence/wordpress \
    WP_ADMIN_PASSWORD=$(cat /run/secrets/wp_admin_password) \
    WP_USER_PASSWORD=$(cat /run/secrets/wp_user_password)

echo "Vault ready"
