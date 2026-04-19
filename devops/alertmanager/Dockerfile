# Récupère le binaire du bridge Discord
FROM benjojo/alertmanager-discord AS discord-bridge

FROM prom/alertmanager:v0.26.0

# Copie le bridge Discord dans le container alertmanager
COPY --from=discord-bridge /go/bin/alertmanager-discord /alertmanager-discord

COPY tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
