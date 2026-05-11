#!/bin/sh
set -eu

ES_URL="${ELASTIC_HOSTS:-http://elasticsearch:9200}"
ES_USER="${ELASTIC_USERNAME:-elastic}"
ES_PASS="${ELASTIC_PASSWORD:?ELASTIC_PASSWORD is required}"
KIBANA_URL="${KIBANA_URL:-http://kibana:5601}"

call_api() {
  method="$1"
  path="$2"
  data="${3:-}"

  if [ -n "$data" ]; then
    curl -fsS -u "$ES_USER:$ES_PASS" -H "Content-Type: application/json" -X "$method" "$ES_URL$path" -d "$data" >/dev/null
  else
    curl -fsS -u "$ES_USER:$ES_PASS" -H "Content-Type: application/json" -X "$method" "$ES_URL$path" >/dev/null
  fi
}

retry_call_api() {
  max_attempts="${1:-10}"
  method="$2"
  path="$3"
  data="${4:-}"

  attempt=1
  while [ "$attempt" -le "$max_attempts" ]; do
    if call_api "$method" "$path" "$data"; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 2
  done

  echo "[elastic-init] Failed after ${max_attempts} attempts: ${method} ${path}" >&2
  return 1
}

call_kibana() {
  method="$1"
  path="$2"
  data="${3:-}"

  if [ -n "$data" ]; then
    curl -fsS -u "$ES_USER:$ES_PASS" -H "kbn-xsrf: true" -H "Content-Type: application/json" -X "$method" "$KIBANA_URL$path" -d "$data" >/dev/null
  else
    curl -fsS -u "$ES_USER:$ES_PASS" -H "kbn-xsrf: true" -X "$method" "$KIBANA_URL$path" >/dev/null
  fi
}

retry_call_kibana() {
  max_attempts="${1:-20}"
  method="$2"
  path="$3"
  data="${4:-}"

  attempt=1
  while [ "$attempt" -le "$max_attempts" ]; do
    if call_kibana "$method" "$path" "$data"; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 3
  done

  echo "[elastic-init] Failed after ${max_attempts} attempts: ${method} ${path}" >&2
  return 1
}

echo "[elastic-init] Waiting for Elasticsearch..."
while true; do
  if curl -sS -u "$ES_USER:$ES_PASS" "$ES_URL/_cluster/health" >/dev/null 2>&1; then
    break
  fi
  sleep 3
done

# Set kibana_system password so Kibana can authenticate without using the forbidden elastic superuser.
retry_call_api 20 POST "/_security/user/kibana_system/_password" "{\"password\":\"$ES_PASS\"}" || \
  echo "[elastic-init] Warning: could not update kibana_system password, continuing."

# Retention policy for logs (hot/warm/delete)
call_api PUT "/_ilm/policy/transcendence-logs-policy" '{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_primary_shard_size": "5gb",
            "max_age": "1d"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "set_priority": {
            "priority": 50
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}' || echo "[elastic-init] Warning: failed to apply ILM policy, continuing."

# Index template linked to ILM policy
call_api PUT "/_index_template/transcendence-logs-template" '{
  "index_patterns": ["transcendence-logs-*"],
  "template": {
    "settings": {
      "index.lifecycle.name": "transcendence-logs-policy",
      "index.lifecycle.rollover_alias": "transcendence-logs"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "message": { "type": "text" },
        "event.dataset": { "type": "keyword" },
        "container_name": { "type": "keyword" },
        "image": { "type": "keyword" },
        "level": { "type": "keyword" }
      }
    }
  },
  "priority": 500
}' || echo "[elastic-init] Warning: failed to apply index template, continuing."

# Bootstrap write index/alias (ignore if already exists)
curl -fsS -u "$ES_USER:$ES_PASS" -H "Content-Type: application/json" -X PUT "$ES_URL/transcendence-logs-000001" -d '{
  "aliases": {
    "transcendence-logs": {
      "is_write_index": true
    }
  }
}' >/dev/null || true

# Snapshot repository for archiving old indices
call_api PUT "/_snapshot/transcendence_fs_repo" '{
  "type": "fs",
  "settings": {
    "location": "/snapshots",
    "compress": true
  }
}' || echo "[elastic-init] Warning: failed to configure snapshot repository, continuing."

# Daily snapshot policy for logs archiving
call_api PUT "/_slm/policy/transcendence-daily-snapshots" '{
  "schedule": "0 30 2 * * ?",
  "name": "transcendence-logs-<now/d>",
  "repository": "transcendence_fs_repo",
  "config": {
    "indices": ["transcendence-logs-*"],
    "ignore_unavailable": true,
    "include_global_state": false
  },
  "retention": {
    "expire_after": "30d",
    "min_count": 7,
    "max_count": 60
  }
}' || echo "[elastic-init] Warning: failed to configure SLM policy, continuing."

echo "[elastic-init] Waiting for Kibana..."
while true; do
  if curl -sS -u "$ES_USER:$ES_PASS" "$KIBANA_URL/api/status" 2>/dev/null | grep -Eq '"available"|"green"'; then
    break
  fi
  sleep 3
done

# Import dashboard and related saved objects if the file is mounted.
if [ -f /scripts/dashboard.ndjson ]; then
  if ! curl -fsS -u "$ES_USER:$ES_PASS" -H "kbn-xsrf: true" -X POST \
    "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
    -F "file=@/scripts/dashboard.ndjson;type=application/ndjson" >/dev/null; then
    echo "[elastic-init] Warning: dashboard import failed, continuing with fallback dashboard creation."
  fi

  dashboard_count="$(curl -sS -u "$ES_USER:$ES_PASS" -H "kbn-xsrf: true" \
    "$KIBANA_URL/api/saved_objects/_find?type=dashboard&search_fields=id&search=transcendence-elasticsearch-dashboard" \
    2>/dev/null | tr -d '\n' | sed -n 's/.*"total":\([0-9][0-9]*\).*/\1/p' | head -n1)"

  if [ -z "$dashboard_count" ] || [ "$dashboard_count" = "0" ]; then
    curl -sS -u "$ES_USER:$ES_PASS" -H "kbn-xsrf: true" -H "Content-Type: application/json" -X POST \
      "$KIBANA_URL/api/saved_objects/dashboard/transcendence-elasticsearch-dashboard?overwrite=true" \
      -d '{
        "attributes": {
          "title": "Transcendence Elasticsearch",
          "description": "Autocreated fallback dashboard",
          "timeRestore": false,
          "panelsJSON": "[]",
          "optionsJSON": "{\"useMargins\":true,\"syncColors\":false,\"syncCursor\":true,\"syncTooltips\":false,\"hidePanelTitles\":false}",
          "kibanaSavedObjectMeta": {
            "searchSourceJSON": "{\"query\":{\"language\":\"kuery\",\"query\":\"\"},\"filter\":[]}"
          }
        }
      }' >/dev/null || echo "[elastic-init] Warning: fallback dashboard creation failed."
  fi

  # Open Kibana directly on the Elasticsearch dashboard.
  retry_call_kibana 20 POST "/api/kibana/settings" '{
    "changes": {
      "defaultRoute": "/app/dashboards#/view/transcendence-elasticsearch-dashboard"
    }
  }' || echo "[elastic-init] Warning: failed to set default route."
  echo "[elastic-init] Kibana dashboard imported and set as default route."
else
  echo "[elastic-init] dashboard.ndjson not found at /scripts/dashboard.ndjson, skipping Kibana import."
fi

echo "[elastic-init] ILM and snapshot policies configured."
