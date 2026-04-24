
#!/bin/sh
 
KIBANA_URL="${KIBANA_URL:-http://kibana:5601}"
MAX_RETRIES=60
RETRY_INTERVAL=5
 
echo "Initialisation de Kibana..."
echo "   URL: $KIBANA_URL"
echo ""
 
wait_for_kibana() {
    retries=0
    echo "Attente du demarrage de Kibana..."
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -sf "$KIBANA_URL/api/status" | grep -q '"level":"available"'; then
            echo "Kibana est pret !"
            return 0
        fi
        retries=$((retries + 1))
        echo "   Tentative $retries/$MAX_RETRIES - Nouvelle verification dans ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    done
    echo "Timeout: Kibana n'a pas demarre apres $((MAX_RETRIES * RETRY_INTERVAL)) secondes"
    return 1
}
 
wait_for_kibana || exit 1
 
echo ""
echo "Creation de l index-pattern filebeat-*..."
curl -sf -X POST "$KIBANA_URL/api/saved_objects/index-pattern/filebeat-index-pattern" \
    -H 'kbn-xsrf: true' \
    -H 'Content-Type: application/json' \
    -d '{
        "attributes": {
            "title": "filebeat-*",
            "timeFieldName": "@timestamp"
        }
    }' > /dev/null 2>&1 && echo "Index-pattern cree !" || echo "Index-pattern deja existant (non bloquant)"
 
echo "Creation de la data view filebeat-*..."
curl -sf -X POST "$KIBANA_URL/api/data_views/data_view" \
    -H 'kbn-xsrf: true' \
    -H 'Content-Type: application/json' \
    -d '{
        "data_view": {
            "id": "filebeat-index-pattern",
            "title": "filebeat-*",
            "timeFieldName": "@timestamp"
        }
    }' > /dev/null 2>&1 && echo "Data view creee !" || echo "Data view deja existante (non bloquant)"
 
echo ""
echo "Import du dashboard..."
 
if [ -f /dashboard/dashboard.ndjson ]; then
    response=$(curl -X POST "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
        -H 'kbn-xsrf: true' \
        --form file=@/dashboard/dashboard.ndjson \
        2>/dev/null)
 
    if echo "$response" | grep -q '"success":true'; then
        echo "Dashboard importe avec succes !"
    else
        echo "Erreur lors de l'import du dashboard"
        echo "   Reponse: $response"
    fi
else
    echo "Fichier dashboard.ndjson introuvable"
    exit 1
fi
 
echo ""
echo "Configuration terminee !"
echo "Acces Kibana : http://localhost:5601"
echo "Dashboard : Menu -> Dashboard -> 'ft_transcendance - Logs Overview'"
echo ""