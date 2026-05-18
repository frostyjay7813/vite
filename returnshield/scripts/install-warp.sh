#!/usr/bin/env bash

set -euo pipefail

# Idempotent Cloudflare WARP installer/enroller for Debian/Ubuntu nodes.
# Usage:
#   ./scripts/install-warp.sh
#   WARP_CONNECT=0 ./scripts/install-warp.sh
#   WARP_MODE=doh ./scripts/install-warp.sh
#
# Optional env vars:
#   WARP_CONNECT       1|0  (default: 1)
#   WARP_MODE          warp|doh|warp+doh (default: warp+doh)
#   WARP_RETRIES       retry count for network/package steps (default: 5)
#   WARP_RETRY_DELAY   seconds between retries (default: 5)

readonly WARP_CONNECT="${WARP_CONNECT:-1}"
readonly WARP_MODE="${WARP_MODE:-warp+doh}"
readonly WARP_RETRIES="${WARP_RETRIES:-5}"
readonly WARP_RETRY_DELAY="${WARP_RETRY_DELAY:-5}"

log() {
  printf '[warp-setup] %s\n' "$*"
}

retry() {
  local attempts="${1:?attempts required}"
  local delay="${2:?delay required}"
  shift 2
  local i=1
  while true; do
    if "$@"; then
      return 0
    fi
    if [ "$i" -ge "$attempts" ]; then
      return 1
    fi
    log "command failed (attempt $i/$attempts): $*"
    sleep "$delay"
    i=$((i + 1))
  done
}

require_root() {
  if [ "${EUID:-$(id -u)}" -ne 0 ]; then
    log "please run as root (sudo ./scripts/install-warp.sh)"
    exit 1
  fi
}

detect_codename() {
  if [ -r /etc/os-release ]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    if [ -n "${VERSION_CODENAME:-}" ]; then
      printf '%s\n' "$VERSION_CODENAME"
      return 0
    fi
  fi
  return 1
}

install_repo_key_and_source() {
  local codename="$1"
  local keyring="/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg"
  local source_file="/etc/apt/sources.list.d/cloudflare-client.list"

  if [ ! -f "$keyring" ]; then
    log "installing Cloudflare repository key"
    retry "$WARP_RETRIES" "$WARP_RETRY_DELAY" bash -c \
      "curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | gpg --dearmor > '$keyring'"
  fi

  local expected_line="deb [signed-by=${keyring}] https://pkg.cloudflareclient.com/ ${codename} main"
  if [ ! -f "$source_file" ] || ! grep -Fq "$expected_line" "$source_file"; then
    log "writing Cloudflare apt source (${codename})"
    printf '%s\n' "$expected_line" > "$source_file"
  fi
}

install_warp_package() {
  log "updating apt cache"
  retry "$WARP_RETRIES" "$WARP_RETRY_DELAY" apt-get update

  if dpkg -s cloudflare-warp >/dev/null 2>&1; then
    log "cloudflare-warp already installed"
  else
    log "installing cloudflare-warp"
    retry "$WARP_RETRIES" "$WARP_RETRY_DELAY" apt-get install -y cloudflare-warp
  fi
}

ensure_service_running() {
  log "enabling and starting warp-svc"
  systemctl enable --now warp-svc
  retry "$WARP_RETRIES" "$WARP_RETRY_DELAY" systemctl is-active --quiet warp-svc
}

ensure_registered() {
  local status
  status="$(warp-cli registration show 2>&1 || true)"
  if printf '%s' "$status" | grep -qi "missing registration"; then
    log "creating WARP registration"
    retry "$WARP_RETRIES" "$WARP_RETRY_DELAY" warp-cli registration new
  else
    log "WARP registration already present"
  fi
}

ensure_mode() {
  local current
  current="$(warp-cli settings 2>/dev/null | awk -F': *' '/Mode:/ {print $2; exit}' || true)"
  if [ "$current" = "$WARP_MODE" ]; then
    log "WARP mode already set to ${WARP_MODE}"
    return 0
  fi

  log "setting WARP mode to ${WARP_MODE}"
  warp-cli mode "$WARP_MODE"
}

ensure_connected() {
  local status
  status="$(warp-cli status 2>/dev/null || true)"
  if printf '%s' "$status" | grep -qi "Connected"; then
    log "WARP already connected"
    return 0
  fi

  log "connecting WARP"
  retry "$WARP_RETRIES" "$WARP_RETRY_DELAY" warp-cli connect
}

main() {
  require_root

  if ! command -v curl >/dev/null 2>&1; then
    log "curl is required"
    exit 1
  fi
  if ! command -v gpg >/dev/null 2>&1; then
    log "gpg is required"
    exit 1
  fi

  local codename
  codename="$(detect_codename)" || {
    log "unable to detect distro codename from /etc/os-release"
    exit 1
  }

  install_repo_key_and_source "$codename"
  install_warp_package
  ensure_service_running
  ensure_registered
  ensure_mode

  if [ "$WARP_CONNECT" = "1" ]; then
    ensure_connected
  else
    log "WARP_CONNECT=0, skipping connect"
  fi

  log "final status:"
  warp-cli status || true
}

main "$@"
