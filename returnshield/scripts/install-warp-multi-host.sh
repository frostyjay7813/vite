#!/usr/bin/env bash

set -euo pipefail

# Deploy scripts/install-warp.sh across multiple hosts over SSH.
# Usage:
#   ./scripts/install-warp-multi-host.sh --hosts hosts.txt --user ubuntu
#   ./scripts/install-warp-multi-host.sh --hosts hosts.txt --user root --key ~/.ssh/id_ed25519
#
# hosts.txt format:
#   one host per line, supports:
#   - hostname
#   - ip
#   - user@host
#   blank lines and comments (# ...) are ignored

HOSTS_FILE=""
DEFAULT_USER=""
SSH_KEY=""
SSH_PORT="22"
REMOTE_SCRIPT_PATH="/tmp/install-warp.sh"
CONNECT_TIMEOUT="10"
EXTRA_WARP_ENV=""

usage() {
  cat <<'EOF'
Usage:
  install-warp-multi-host.sh --hosts <file> [--user <name>] [--key <path>] [--port <port>]
                             [--warp-env "WARP_MODE=doh WARP_CONNECT=1"]

Required:
  --hosts     File with target hosts (one per line).

Optional:
  --user      Default SSH username (used when line is not user@host).
  --key       SSH private key path.
  --port      SSH port (default: 22).
  --warp-env  Environment vars passed to remote script.

Examples:
  ./scripts/install-warp-multi-host.sh --hosts hosts.txt --user ubuntu
  ./scripts/install-warp-multi-host.sh --hosts hosts.txt --user root --warp-env "WARP_MODE=warp"
EOF
}

log() {
  printf '[warp-rollout] %s\n' "$*"
}

parse_args() {
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --hosts)
        HOSTS_FILE="${2:-}"
        shift 2
        ;;
      --user)
        DEFAULT_USER="${2:-}"
        shift 2
        ;;
      --key)
        SSH_KEY="${2:-}"
        shift 2
        ;;
      --port)
        SSH_PORT="${2:-}"
        shift 2
        ;;
      --warp-env)
        EXTRA_WARP_ENV="${2:-}"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        log "unknown argument: $1"
        usage
        exit 1
        ;;
    esac
  done

  if [ -z "$HOSTS_FILE" ]; then
    log "--hosts is required"
    usage
    exit 1
  fi
  if [ ! -f "$HOSTS_FILE" ]; then
    log "hosts file not found: $HOSTS_FILE"
    exit 1
  fi
}

build_ssh_cmd() {
  local base=("ssh" "-p" "$SSH_PORT" "-o" "BatchMode=yes" "-o" "ConnectTimeout=${CONNECT_TIMEOUT}")
  if [ -n "$SSH_KEY" ]; then
    base+=("-i" "$SSH_KEY")
  fi
  printf '%q ' "${base[@]}"
}

build_scp_cmd() {
  local base=("scp" "-P" "$SSH_PORT" "-o" "BatchMode=yes" "-o" "ConnectTimeout=${CONNECT_TIMEOUT}")
  if [ -n "$SSH_KEY" ]; then
    base+=("-i" "$SSH_KEY")
  fi
  printf '%q ' "${base[@]}"
}

target_for_line() {
  local line="$1"
  if [[ "$line" == *"@"* ]]; then
    printf '%s\n' "$line"
    return
  fi
  if [ -n "$DEFAULT_USER" ]; then
    printf '%s@%s\n' "$DEFAULT_USER" "$line"
    return
  fi
  printf '%s\n' "$line"
}

deploy_host() {
  local target="$1"
  local ssh_cmd scp_cmd
  ssh_cmd="$(build_ssh_cmd)"
  scp_cmd="$(build_scp_cmd)"

  log "[$target] uploading installer"
  # shellcheck disable=SC2086
  eval "${scp_cmd} ./scripts/install-warp.sh ${target}:${REMOTE_SCRIPT_PATH}"

  log "[$target] executing installer"
  local remote_cmd="chmod +x ${REMOTE_SCRIPT_PATH} && sudo ${EXTRA_WARP_ENV} ${REMOTE_SCRIPT_PATH}"
  # shellcheck disable=SC2086
  eval "${ssh_cmd} ${target} \"${remote_cmd}\""

  log "[$target] collecting status"
  # shellcheck disable=SC2086
  eval "${ssh_cmd} ${target} \"warp-cli status || true\""
}

main() {
  parse_args "$@"

  local ok=0
  local fail=0

  while IFS= read -r raw_line || [ -n "$raw_line" ]; do
    local line
    line="$(printf '%s' "$raw_line" | sed 's/[[:space:]]*$//')"
    if [ -z "$line" ] || [[ "$line" =~ ^# ]]; then
      continue
    fi

    local target
    target="$(target_for_line "$line")"

    if deploy_host "$target"; then
      ok=$((ok + 1))
    else
      log "[$target] failed"
      fail=$((fail + 1))
    fi
  done < "$HOSTS_FILE"

  log "rollout complete: success=${ok}, failed=${fail}"
  if [ "$fail" -gt 0 ]; then
    exit 1
  fi
}

main "$@"
