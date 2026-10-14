#!/usr/bin/env bash
set -Eeuo pipefail

# Forced command for the GitHub Actions deploy keys. Install it root-owned:
#
#   sudo install -o root -g root -m 0755 ops/aurevia-ssh-gate.sh /usr/local/sbin/aurevia-ssh-gate
#
# and pin each environment's key in /home/deploy/.ssh/authorized_keys:
#
#   restrict,command="/usr/local/sbin/aurevia-ssh-gate staging" ssh-ed25519 AAAA... github-actions-staging
#   restrict,command="/usr/local/sbin/aurevia-ssh-gate production" ssh-ed25519 AAAA... github-actions-production
#
# The environment comes from authorized_keys, never from the client, so the
# staging key can only deploy staging. `restrict` removes shell, PTY and
# forwarding access. The client streams the archive on stdin:
#
#   ssh deploy@HOST "<environment> <40-character-git-sha> <sha256>" < release.tar.gz
#
# The requested environment must match the pinned one, which catches a key
# stored in the wrong GitHub environment.

PINNED_ENVIRONMENT="${1:-}"
INBOX_ROOT="/home/deploy/aurevia-incoming"
MAX_ARCHIVE_BYTES=$((512 * 1024 * 1024))

if [[ "$PINNED_ENVIRONMENT" != "staging" && "$PINNED_ENVIRONMENT" != "production" ]]; then
  echo "Deploy gate is misconfigured: pin staging or production in authorized_keys." >&2
  exit 1
fi

read -r REQUESTED_ENVIRONMENT REVISION ARCHIVE_HASH EXTRA <<<"${SSH_ORIGINAL_COMMAND:-}"

if [[ ! "${REQUESTED_ENVIRONMENT:-}" =~ ^(staging|production)$ ||
  ! "${REVISION:-}" =~ ^[0-9a-f]{40}$ ||
  ! "${ARCHIVE_HASH:-}" =~ ^[0-9a-f]{64}$ ||
  -n "${EXTRA:-}" ]]; then
  echo "Usage: ssh HOST '<staging|production> <40-character-git-sha> <sha256>' < release.tar.gz" >&2
  exit 1
fi

if [[ "$REQUESTED_ENVIRONMENT" != "$PINNED_ENVIRONMENT" ]]; then
  echo "This key may only deploy $PINNED_ENVIRONMENT; refusing a $REQUESTED_ENVIRONMENT deployment." >&2
  exit 1
fi

umask 077
ARCHIVE_NAME="${PINNED_ENVIRONMENT}-$(date -u +%Y%m%d-%H%M%S)-$$-${REVISION}.tar.gz"
ARCHIVE="$INBOX_ROOT/$ARCHIVE_NAME"
trap 'rm -f -- "$ARCHIVE" "$ARCHIVE.sha256"' EXIT

install -d -m 0700 "$INBOX_ROOT"

# Read one byte past the limit so an oversized upload is rejected, not truncated.
head -c "$((MAX_ARCHIVE_BYTES + 1))" > "$ARCHIVE"

if (( $(stat -c %s -- "$ARCHIVE") > MAX_ARCHIVE_BYTES )); then
  echo "Release archive exceeds $MAX_ARCHIVE_BYTES bytes." >&2
  exit 1
fi

printf '%s  %s\n' "$ARCHIVE_HASH" "$ARCHIVE_NAME" > "$ARCHIVE.sha256"

# The root helper verifies the checksum, deploys, health-checks, rolls back on
# failure and removes both inbox files.
trap - EXIT
exec sudo -n /usr/local/sbin/aurevia-deploy "$PINNED_ENVIRONMENT" "$ARCHIVE" "$REVISION"
