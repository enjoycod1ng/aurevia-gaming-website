#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_ENVIRONMENT="${1:-}"
ARCHIVE="${2:-}"
REVISION="${3:-}"
VPS_PORT="${VPS_PORT:-22}"
VPS_INBOX="/home/deploy/aurevia-incoming"

required_variables=(VPS_HOST VPS_USER VPS_SSH_KEY VPS_KNOWN_HOSTS)

for variable in "${required_variables[@]}"; do
  if [[ -z "${!variable:-}" ]]; then
    echo "Missing required environment variable: $variable" >&2
    exit 1
  fi
done

if [[ "$DEPLOY_ENVIRONMENT" != "staging" && "$DEPLOY_ENVIRONMENT" != "production" ]]; then
  echo "Deployment environment must be staging or production." >&2
  exit 1
fi

if [[ ! "$REVISION" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Revision must be a lowercase 40-character Git commit SHA." >&2
  exit 1
fi

if [[ ! "$VPS_PORT" =~ ^[0-9]{1,5}$ ]] || (( VPS_PORT < 1 || VPS_PORT > 65535 )); then
  echo "VPS_PORT must be a valid TCP port." >&2
  exit 1
fi

if [[ ! -f "$ARCHIVE" || ! -f "$ARCHIVE.sha256" ]]; then
  echo "Release archive or checksum is missing: $ARCHIVE" >&2
  exit 1
fi

SSH_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/aurevia-ssh.XXXXXX")"
trap 'rm -rf -- "$SSH_DIR"' EXIT

printf '%s\n' "$VPS_SSH_KEY" > "$SSH_DIR/id_ed25519"
printf '%s\n' "$VPS_KNOWN_HOSTS" > "$SSH_DIR/known_hosts"
chmod 0700 "$SSH_DIR"
chmod 0600 "$SSH_DIR/id_ed25519" "$SSH_DIR/known_hosts"

SSH_OPTIONS=(
  -F /dev/null
  -i "$SSH_DIR/id_ed25519"
  -o BatchMode=yes
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=yes
  -o UserKnownHostsFile="$SSH_DIR/known_hosts"
  -o ConnectTimeout=15
)

retry_connection() {
  local attempt=1

  until "$@"; do
    if (( attempt >= 5 )); then
      return 1
    fi

    echo "SSH connection attempt $attempt failed; retrying in 5 seconds..." >&2
    sleep 5
    ((attempt += 1))
  done
}

REMOTE_NAME="${DEPLOY_ENVIRONMENT}-${GITHUB_RUN_ID:-manual}-${GITHUB_RUN_ATTEMPT:-1}-${REVISION}.tar.gz"
REMOTE_ARCHIVE="$VPS_INBOX/$REMOTE_NAME"
REMOTE_CHECKSUM="$REMOTE_ARCHIVE.sha256"
REMOTE_TARGET="$VPS_USER@$VPS_HOST"
ARCHIVE_HASH="$(awk 'NR == 1 { print $1 }' "$ARCHIVE.sha256")"

if [[ ! "$ARCHIVE_HASH" =~ ^[0-9a-f]{64}$ ]]; then
  echo "Release checksum is invalid: $ARCHIVE.sha256" >&2
  exit 1
fi

printf '%s  %s\n' "$ARCHIVE_HASH" "$REMOTE_NAME" > "$SSH_DIR/release.sha256"

retry_connection ssh "${SSH_OPTIONS[@]}" -p "$VPS_PORT" "$REMOTE_TARGET" "install -d -m 0700 '$VPS_INBOX'"
retry_connection scp "${SSH_OPTIONS[@]}" -P "$VPS_PORT" "$ARCHIVE" "$REMOTE_TARGET:$REMOTE_ARCHIVE"
retry_connection scp "${SSH_OPTIONS[@]}" -P "$VPS_PORT" "$SSH_DIR/release.sha256" "$REMOTE_TARGET:$REMOTE_CHECKSUM"

retry_connection ssh "${SSH_OPTIONS[@]}" -p "$VPS_PORT" "$REMOTE_TARGET" \
  "sudo -n /usr/local/sbin/aurevia-deploy '$DEPLOY_ENVIRONMENT' '$REMOTE_ARCHIVE' '$REVISION'"
