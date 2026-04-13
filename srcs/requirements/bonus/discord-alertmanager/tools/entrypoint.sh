#!/bin/sh
export DISCORD_WEBHOOK=$(cat /run/secrets/discord_webhook)
exec /alertmanager-discord
