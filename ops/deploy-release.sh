#!/usr/bin/env bash
set -Eeuo pipefail

DEPLOY_ENVIRONMENT="${1:-}"
ARCHIVE_INPUT="${2:-}"
REVISION="${3:-}"
INBOX_ROOT="/home/deploy/aurevia-incoming"
KEEP_RELEASES=5

usage() {
  echo "Usage: aurevia-deploy <staging|production> <archive.tar.gz> <40-character-git-sha>" >&2
}

if [[ "$EUID" -ne 0 ]]; then
  echo "This deployment helper must run through sudo." >&2
  exit 1
fi

if [[ "$DEPLOY_ENVIRONMENT" != "staging" && "$DEPLOY_ENVIRONMENT" != "production" ]]; then
  usage
  exit 1
fi

if [[ ! "$REVISION" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Revision must be a lowercase 40-character Git commit SHA." >&2
  exit 1
fi

if [[ -z "$ARCHIVE_INPUT" || ! -f "$ARCHIVE_INPUT" ]]; then
  usage
  exit 1
fi

ARCHIVE_SOURCE="$(readlink -f -- "$ARCHIVE_INPUT")"
CHECKSUM_SOURCE="$(readlink -f -- "$ARCHIVE_INPUT.sha256")"

case "$ARCHIVE_SOURCE" in
  "$INBOX_ROOT"/*.tar.gz) ;;
  *)
    echo "Archive must resolve inside $INBOX_ROOT." >&2
    exit 1
    ;;
esac

case "$CHECKSUM_SOURCE" in
  "$INBOX_ROOT"/*.tar.gz.sha256) ;;
  *)
    echo "Checksum must resolve inside $INBOX_ROOT." >&2
    exit 1
    ;;
esac

if [[ ! -f "$CHECKSUM_SOURCE" ]]; then
  echo "Missing checksum: $ARCHIVE_INPUT.sha256" >&2
  exit 1
fi

WORK_DIR="$(mktemp -d /var/tmp/aurevia-deploy.XXXXXX)"
ARCHIVE="$WORK_DIR/release.tar.gz"
chown root:deploy "$WORK_DIR"
chmod 0750 "$WORK_DIR"

cleanup() {
  rm -f -- "$ARCHIVE_SOURCE" "$CHECKSUM_SOURCE"
  rm -rf -- "${WORK_DIR:?}"
}
trap cleanup EXIT

install -o root -g deploy -m 0640 "$ARCHIVE_SOURCE" "$ARCHIVE"
EXPECTED_HASH="$(awk 'NR == 1 { print $1 }' "$CHECKSUM_SOURCE")"
ACTUAL_HASH="$(sha256sum "$ARCHIVE" | awk '{ print $1 }')"

if [[ ! "$EXPECTED_HASH" =~ ^[0-9a-f]{64}$ || "$ACTUAL_HASH" != "$EXPECTED_HASH" ]]; then
  echo "Release checksum validation failed." >&2
  exit 1
fi

while IFS= read -r archive_entry; do
  normalized_entry="${archive_entry#./}"
  if [[ "$normalized_entry" == /* ||
    "$normalized_entry" == ".." ||
    "$normalized_entry" == ../* ||
    "$normalized_entry" == */../* ]]; then
    echo "Release archive contains an unsafe path: $archive_entry" >&2
    exit 1
  fi
done < <(tar -tzf "$ARCHIVE")

case "$DEPLOY_ENVIRONMENT" in
  production)
    APP_ROOT="/var/www/aurevia-gaming"
    PROCESS_NAME="aurevia-gaming"
    PORT=3000
    ENV_FILE="/etc/aurevia-gaming/production.env"
    ;;
  staging)
    APP_ROOT="/var/www/aurevia-gaming-staging"
    PROCESS_NAME="aurevia-gaming-staging"
    PORT=3001
    ENV_FILE="/etc/aurevia-gaming/staging.env"
    ;;
esac

APP_USER="deploy"
APP_GROUP="deploy"
APP_HOME="$(getent passwd "$APP_USER" | cut -d: -f6)"
RELEASES_ROOT="$APP_ROOT/releases"
CURRENT_LINK="$APP_ROOT/current"
LOCK_FILE="/run/lock/aurevia-${DEPLOY_ENVIRONMENT}.lock"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
RELEASE_DIR="$RELEASES_ROOT/${TIMESTAMP}-${REVISION:0:12}"
PREVIOUS_RELEASE=""

if [[ -z "$APP_HOME" || ! -d "$APP_HOME" ]]; then
  echo "Runtime user $APP_USER does not have a valid home directory." >&2
  exit 1
fi

PM2_BIN="$(runuser -u "$APP_USER" -- env HOME="$APP_HOME" bash -lc '
  if command -v pm2 >/dev/null 2>&1; then
    command -v pm2
    exit 0
  fi

  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    source "$HOME/.nvm/nvm.sh"
    nvm use --silent default >/dev/null 2>&1 || true
    command -v pm2
  fi
' || true)"

if [[ -z "$PM2_BIN" ]]; then
  echo "pm2 is not installed or not available in $APP_USER's login PATH." >&2
  exit 1
fi

PM2_BIN_DIR="$(dirname "$PM2_BIN")"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing runtime environment file: $ENV_FILE" >&2
  exit 1
fi

exec 9>"$LOCK_FILE"
if ! flock -w 300 9; then
  echo "Timed out waiting for the $DEPLOY_ENVIRONMENT deployment lock." >&2
  exit 1
fi

if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS_RELEASE="$(readlink -f -- "$CURRENT_LINK")"
fi

install -d -o "$APP_USER" -g "$APP_GROUP" -m 0750 "$RELEASES_ROOT"
install -d -o "$APP_USER" -g "$APP_GROUP" -m 0750 "$RELEASE_DIR"

runuser -u "$APP_USER" -- tar \
  --extract \
  --gzip \
  --file "$ARCHIVE" \
  --directory "$RELEASE_DIR" \
  --no-same-owner \
  --no-same-permissions
printf '%s\n' "$REVISION" > "$RELEASE_DIR/.revision"
printf '%s\n' "$DEPLOY_ENVIRONMENT" > "$RELEASE_DIR/.environment"
chown -R "$APP_USER:$APP_GROUP" "$RELEASE_DIR"

run_pm2() {
  runuser -u "$APP_USER" -- env \
    HOME="$APP_HOME" \
    PATH="$PM2_BIN_DIR:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
    NODE_ENV=production \
    HOSTNAME=127.0.0.1 \
    PORT="$PORT" \
    APP_ENV="$DEPLOY_ENVIRONMENT" \
    APP_REVISION="$1" \
    "$PM2_BIN" "${@:2}"
}

restart_release() {
  local revision="$1"

  if run_pm2 "$revision" describe "$PROCESS_NAME" >/dev/null 2>&1; then
    run_pm2 "$revision" restart "$PROCESS_NAME" --update-env || return 1
  else
    run_pm2 "$revision" start "$CURRENT_LINK/server.js" \
      --name "$PROCESS_NAME" \
      --cwd "$CURRENT_LINK" \
      --node-args="--env-file=$ENV_FILE" \
      --time || return 1
  fi

  run_pm2 "$revision" save || return 1
}

basic_health_check() {
  local response=""

  for _attempt in {1..30}; do
    if response="$(curl --fail --silent --show-error --max-time 5 "http://127.0.0.1:$PORT/api/health" 2>/dev/null)" &&
      grep -Fq '"status":"ok"' <<<"$response"; then
      return 0
    fi

    sleep 1
  done

  return 1
}

health_check() {
  local expected_revision="$1"
  local response=""

  for _attempt in {1..30}; do
    if response="$(curl --fail --silent --show-error --max-time 5 "http://127.0.0.1:$PORT/api/health" 2>/dev/null)" &&
      grep -Fq '"status":"ok"' <<<"$response" &&
      grep -Fq "\"environment\":\"$DEPLOY_ENVIRONMENT\"" <<<"$response" &&
      grep -Fq "\"revision\":\"$expected_revision\"" <<<"$response"; then
      return 0
    fi

    sleep 1
  done

  return 1
}

NEXT_LINK="$APP_ROOT/current.next.$$"
ln -s "$RELEASE_DIR" "$NEXT_LINK"
mv -Tf "$NEXT_LINK" "$CURRENT_LINK"

DEPLOYMENT_FAILED=false

if ! restart_release "$REVISION" || ! health_check "$REVISION"; then
  DEPLOYMENT_FAILED=true
fi

if [[ "$DEPLOYMENT_FAILED" == "true" ]]; then
  echo "Health check failed for $DEPLOY_ENVIRONMENT revision $REVISION; rolling back." >&2

  if [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
    PREVIOUS_REVISION="unknown"

    if [[ -f "$PREVIOUS_RELEASE/.revision" ]]; then
      CANDIDATE_REVISION="$(tr -d '\r\n' < "$PREVIOUS_RELEASE/.revision")"
      if [[ "$CANDIDATE_REVISION" =~ ^[0-9a-f]{40}$ ]]; then
        PREVIOUS_REVISION="$CANDIDATE_REVISION"
      fi
    fi

    ROLLBACK_LINK="$APP_ROOT/current.rollback.$$"
    ln -s "$PREVIOUS_RELEASE" "$ROLLBACK_LINK"
    mv -Tf "$ROLLBACK_LINK" "$CURRENT_LINK"

    if ! restart_release "$PREVIOUS_REVISION" || ! basic_health_check; then
      echo "Automatic rollback also failed; inspect PM2 and Nginx immediately." >&2
    else
      echo "Automatic rollback restored $PREVIOUS_RELEASE." >&2
    fi
  else
    run_pm2 "$REVISION" delete "$PROCESS_NAME" >/dev/null 2>&1 || true
    run_pm2 "$REVISION" save >/dev/null 2>&1 || true
    rm -f -- "$CURRENT_LINK"
  fi

  exit 1
fi

mapfile -t old_releases < <(
  find "$RELEASES_ROOT" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' |
    sort -r |
    tail -n "+$((KEEP_RELEASES + 1))"
)

for release in "${old_releases[@]:-}"; do
  [[ -n "$release" ]] && rm -rf -- "${RELEASES_ROOT:?}/$release"
done

echo "Deployment healthy: environment=$DEPLOY_ENVIRONMENT revision=$REVISION release=$RELEASE_DIR"
