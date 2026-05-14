#!/usr/bin/env bash
set -euo pipefail

TARGET_ROOT="${DOCKER_DATA_ROOT:-/goinfre/${USER}/docker-data}"
TMP_JSON="/tmp/daemon.goinfre.$$.json"

is_rootless() {
  docker info --format '{{join .SecurityOptions ","}}' 2>/dev/null | grep -q 'name=rootless'
}

merge_or_write_daemon_json() {
  local daemon_json="$1"
  local docker_dir
  docker_dir="$(dirname "${daemon_json}")"

  mkdir -p "${docker_dir}"

  if [[ -f "${daemon_json}" ]]; then
    echo "[docker-goinfre] Existing ${daemon_json} detected"
    if command -v jq >/dev/null 2>&1; then
      jq --arg root "${TARGET_ROOT}" '. + {"data-root": $root}' "${daemon_json}" > "${TMP_JSON}"
      cp "${TMP_JSON}" "${daemon_json}"
      rm -f "${TMP_JSON}"
    else
      cat >&2 <<EOF
[docker-goinfre] jq is required to merge with existing ${daemon_json}.
[docker-goinfre] Install jq, or set data-root manually to:
${TARGET_ROOT}
EOF
      exit 1
    fi
  else
    cat > "${daemon_json}" <<EOF
{
  "data-root": "${TARGET_ROOT}"
}
EOF
  fi
}

mkdir -p "${TARGET_ROOT}"

echo "[docker-goinfre] Target Docker data-root: ${TARGET_ROOT}"

if is_rootless; then
  DAEMON_JSON="${HOME}/.config/docker/daemon.json"
  echo "[docker-goinfre] Rootless Docker detected"
  merge_or_write_daemon_json "${DAEMON_JSON}"

  if command -v systemctl >/dev/null 2>&1; then
    echo "[docker-goinfre] Restarting rootless Docker with systemctl --user"
    systemctl --user restart docker
  else
    cat >&2 <<'EOF'
[docker-goinfre] Rootless Docker detected but systemctl --user is unavailable.
[docker-goinfre] Restart your rootless Docker daemon manually, then verify with docker info.
EOF
    exit 1
  fi
else
  DAEMON_JSON="/etc/docker/daemon.json"
  echo "[docker-goinfre] System Docker detected"

  if ! command -v sudo >/dev/null 2>&1; then
    cat >&2 <<'EOF'
[docker-goinfre] System Docker requires sudo to change /etc/docker/daemon.json.
[docker-goinfre] Ask admin to set data-root to /goinfre/<user>/docker-data.
EOF
    exit 1
  fi

  if ! sudo -n true 2>/dev/null; then
    cat >&2 <<'EOF'
[docker-goinfre] sudo access is required for system Docker and is not available non-interactively.
[docker-goinfre] Use rootless Docker, or ask admin to apply /etc/docker/daemon.json.
EOF
    exit 1
  fi

  if [[ -f "${DAEMON_JSON}" ]]; then
    if command -v jq >/dev/null 2>&1; then
      jq --arg root "${TARGET_ROOT}" '. + {"data-root": $root}' "${DAEMON_JSON}" > "${TMP_JSON}"
      sudo cp "${TMP_JSON}" "${DAEMON_JSON}"
      rm -f "${TMP_JSON}"
    else
      cat >&2 <<'EOF'
[docker-goinfre] jq is required to merge with existing /etc/docker/daemon.json.
[docker-goinfre] Install jq, or update /etc/docker/daemon.json manually.
EOF
      exit 1
    fi
  else
    sudo mkdir -p /etc/docker
    sudo tee "${DAEMON_JSON}" >/dev/null <<EOF
{
  "data-root": "${TARGET_ROOT}"
}
EOF
  fi

  if command -v systemctl >/dev/null 2>&1; then
    echo "[docker-goinfre] Restarting system Docker"
    sudo systemctl restart docker
  elif command -v service >/dev/null 2>&1; then
    echo "[docker-goinfre] Restarting system Docker"
    sudo service docker restart
  else
    cat >&2 <<'EOF'
[docker-goinfre] Could not detect service manager to restart Docker.
[docker-goinfre] Restart Docker daemon manually, then run: docker info
EOF
    exit 1
  fi
fi

echo "[docker-goinfre] Done. Verify with: docker info --format '{{.DockerRootDir}}'"
