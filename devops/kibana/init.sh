#!/bin/bash
 
set -e
 
KIBANA_URL="${KIBANA_URL:-http://kibana:5601}"
MAX_RETRIES=60
RETRY_INTERVAL=5
 
echo "🚀 Initialisation de Kibana..."
echo "   URL: $KIBANA_URL"
echo ""
 
# Fonction pour attendre que Kibana soit prêt
wait_for_kibana() {
    local retries=0
    echo "⏳ Attente du démarrage de Kibana..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -sf "$KIBANA_URL/api/status" | grep -q '"level":"available"'; then
            echo "✅ Kibana est prêt !"
            return 0
        fi
        
        retries=$((retries + 1))
        echo "   Tentative $retries/$MAX_RETRIES - Nouvelle vérification dans ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    done
    
    echo "❌ Timeout: Kibana n'a pas démarré après $((MAX_RETRIES * RETRY_INTERVAL)) secondes"
    return 1
}
 
# Fonction pour vérifier si un objet existe déjà
object_exists() {
    local object_type=$1
    local object_id=$2
    
    curl -sf "$KIBANA_URL/api/saved_objects/$object_type/$object_id" \
        -H 'kbn-xsrf: true' > /dev/null 2>&1
    return $?
}
 
# Attendre que Kibana soit prêt
wait_for_kibana || exit 1
 
echo ""
echo "📊 Import du dashboard et des visualisations..."
 
# Importer le dashboard via l'API
if [ -f /dashboard/dashboard.ndjson ]; then
    response=$(curl -X POST "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
        -H 'kbn-xsrf: true' \
        --form file=@/dashboard/dashboard.ndjson \
        2>/dev/null)
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ Dashboard importé avec succès !"
    else
        echo "⚠️  Erreur lors de l'import du dashboard"
        echo "   Réponse: $response"
    fi
else
    echo "❌ Fichier dashboard.ndjson introuvable"
    exit 1
fi
 
echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📍 Accède à Kibana : http://localhost:5601"
echo "📊 Dashboard : Menu → Dashboard → 'ft_transcendance - Logs Overview'"
echo ""
 