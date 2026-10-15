#!/usr/bin/env bash
set -Eeuo pipefail

# Streams a release to the VPS over one SSH connection. Each GitHub
# environment's key is pinned to ops/aurevia-ssh-gate.sh, which decides which
# site it deploys (ops/AUTO-DEPLOY.md):
#
#   ssh deploy@HOST "<environment> <40-character-git-sha> <sha256>" < release.tar.gz

DEPLOY_ENVIRONMENT="${1:-}"
ARCHIVE="${2:-}"
REVISION="${3:-}"
VPS_PORT="${VPS_PORT:-22}"

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

ARCHIVE_HASH="$(awk 'NR == 1 { print $1 }' "$ARCHIVE.sha256")"

if [[ ! "$ARCHIVE_HASH" =~ ^[0-9a-f]{64}$ ]]; then
  echo "Release checksum is invalid: $ARCHIVE.sha256" >&2
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

# Only connection failures (exit 255) are retried: the gate rejects a partial
# upload by checksum, and the helper finishes or rolls back a deployment even if
# the connection drops, then serializes the retry behind it.
for attempt in 1 2 3 4 5; do
  status=0
  ssh "${SSH_OPTIONS[@]}" -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" \
    "$DEPLOY_ENVIRONMENT $REVISION $ARCHIVE_HASH" < "$ARCHIVE" || status=$?

  if (( status == 127 )); then
    echo "The VPS ran the request as a shell command, so this key is not pinned to aurevia-ssh-gate." >&2
    echo "Pin it as described in ops/AUTO-DEPLOY.md (Per-environment deploy keys)." >&2
  fi

  if (( status != 255 )); then
    exit "$status"
  fi

  echo "SSH connection attempt $attempt failed; retrying in 5 seconds..." >&2
  sleep 5
done

exit 255
