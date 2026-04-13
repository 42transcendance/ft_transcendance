#!/bin/sh
set -e

# Lit le webhook Discord depuis le secret Docker
export DISCORD_WEBHOOK=$(cat /run/secrets/discord_webhook)

# Démarre le bridge Discord en arrière-plan (écoute sur :9094, forward vers Discord)
/alertmanager-discord &

# Démarre Alertmanager
exec /bin/alertmanager \
  --config.file=/etc/alertmanager/alertmanager.yml \
  --storage.path=/alertmanager
