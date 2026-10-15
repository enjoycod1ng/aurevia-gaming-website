#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_ENVIRONMENT="${1:-}"
ARCHIVE="${2:-}"
REVISION="${3:-}"
VPS_PORT="${VPS_PORT:-22}"
VPS_INBOX="/home/deploy/aurevia-incoming"
# gated (default): the environment's key is pinned to ops/aurevia-ssh-gate.sh on the VPS.
# legacy: upload with scp, then run the sudo helper over a shell session. That
# key can deploy either environment, so it is used only when requested by name.
VPS_DEPLOY_PROTOCOL="${VPS_DEPLOY_PROTOCOL:-gated}"

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

if [[ "$VPS_DEPLOY_PROTOCOL" != "legacy" && "$VPS_DEPLOY_PROTOCOL" != "gated" ]]; then
  echo "VPS_DEPLOY_PROTOCOL must be legacy or gated." >&2
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
  -o ServerAliveInterval=15
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

if [[ "$VPS_DEPLOY_PROTOCOL" == "gated" ]]; then
  # One connection carries the archive; the VPS decides which site it deploys.
  # Only connection failures (exit 255) are retried: the gate rejects a partial
  # upload by checksum, and the helper finishes or rolls back a deployment even
  # if the connection drops, then serializes the retry behind it.
  for attempt in 1 2 3 4 5; do
    status=0
    ssh "${SSH_OPTIONS[@]}" -p "$VPS_PORT" "$REMOTE_TARGET" \
      "$DEPLOY_ENVIRONMENT $REVISION $ARCHIVE_HASH" < "$ARCHIVE" || status=$?

    if (( status == 127 )); then
      echo "The VPS ran the request as a shell command, so this key is not pinned to aurevia-ssh-gate." >&2
      echo "Pin it as described in ops/AUTO-DEPLOY.md, or set VPS_DEPLOY_PROTOCOL=legacy for this environment until then." >&2
    fi

    if (( status != 255 )); then
      exit "$status"
    fi

    echo "SSH connection attempt $attempt failed; retrying in 5 seconds..." >&2
    sleep 5
  done

  exit 255
fi

echo "Using the legacy protocol: this key has a shell on the VPS and can deploy either environment." >&2
printf '%s  %s\n' "$ARCHIVE_HASH" "$REMOTE_NAME" > "$SSH_DIR/release.sha256"

retry_connection ssh "${SSH_OPTIONS[@]}" -p "$VPS_PORT" "$REMOTE_TARGET" "install -d -m 0700 '$VPS_INBOX'"
retry_connection scp "${SSH_OPTIONS[@]}" -P "$VPS_PORT" "$ARCHIVE" "$REMOTE_TARGET:$REMOTE_ARCHIVE"
retry_connection scp "${SSH_OPTIONS[@]}" -P "$VPS_PORT" "$SSH_DIR/release.sha256" "$REMOTE_TARGET:$REMOTE_CHECKSUM"

ssh "${SSH_OPTIONS[@]}" -p "$VPS_PORT" "$REMOTE_TARGET" \
  "sudo -n /usr/local/sbin/aurevia-deploy '$DEPLOY_ENVIRONMENT' '$REMOTE_ARCHIVE' '$REVISION'"
