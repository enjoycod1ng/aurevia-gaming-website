#!/usr/bin/env bash
set -Eeuo pipefail

KEEP_RELEASES=5
# Free space that must remain after unpacking, for the image cache, logs and PM2.
FREE_SPACE_MARGIN_KB=$((256 * 1024))
LOCK_DIR="/run/aurevia-deploy"
LOG_DIR="/var/log/aurevia-deploy"

usage() {
  echo "Usage: aurevia-deploy <staging|production> <archive.tar.gz> <40-character-git-sha>" >&2
}

# Accepts only regular files and directories at relative paths without "..".
# Links are refused outright: tar would create them, and any later write
# through one could land outside the release.
check_release_archive() {
  local archive="$1" listing="" names="" line="" name=""

  if ! listing="$(tar -tvzf "$archive")" || ! names="$(tar -tzf "$archive")"; then
    echo "Release archive could not be listed." >&2
    return 1
  fi

  if [[ -z "$names" ]]; then
    echo "Release archive is empty." >&2
    return 1
  fi

  while IFS= read -r line; do
    if [[ "${line:0:1}" != "-" && "${line:0:1}" != "d" ]]; then
      echo "Release archive may only contain regular files and directories: $line" >&2
      return 1
    fi
  done <<<"$listing"

  while IFS= read -r name; do
    name="${name#./}"
    if [[ "$name" == /* || "$name" == ".." || "$name" == ../* || "$name" == */../* || "$name" == */.. ]]; then
      echo "Release archive contains an unsafe path: $name" >&2
      return 1
    fi
  done <<<"$names"
}

# Refuses to unpack unless the release fits with FREE_SPACE_MARGIN_KB to spare.
check_free_space() {
  local archive="$1" directory="$2" unpacked_bytes="" needed_kb="" available_kb=""

  unpacked_bytes="$(gzip -dc -- "$archive" | wc -c)" || return 1
  needed_kb=$(((unpacked_bytes + 1023) / 1024 + FREE_SPACE_MARGIN_KB))
  available_kb="$(df -Pk -- "$directory" | awk 'NR == 2 { print $4 }')"

  if [[ ! "$available_kb" =~ ^[0-9]+$ ]] || ((available_kb < needed_kb)); then
    echo "Not enough free space in $directory: the release needs $needed_kb KiB, ${available_kb:-unknown} KiB is available." >&2
    return 1
  fi
}

# Prints the release directories retention may delete: everything except the
# newest $2 and any release named by a further argument (the live and the
# previous release). Only <date>-<time>-<sha> directories are considered.
prunable_releases() {
  local releases_root="$1" keep="$2" name="" protected="" position=0
  shift 2

  while IFS= read -r name; do
    position=$((position + 1))
    ((position <= keep)) && continue

    for protected in "$@"; do
      [[ -n "$protected" && "$name" == "$(basename -- "$protected")" ]] && continue 2
    done

    printf '%s\n' "$name"
  done < <(
    find "$releases_root" -mindepth 1 -maxdepth 1 -type d \
      -name '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9]-*' \
      -printf '%f\n' |
      LC_ALL=C sort -r
  )
}

# Tests source this file for the functions above; only a direct run deploys.
if [[ "${BASH_SOURCE[0]}" != "$0" ]]; then
  return 0
fi

DEPLOY_ENVIRONMENT="${1:-}"
ARCHIVE_INPUT="${2:-}"
REVISION="${3:-}"

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

# Each environment runs as, and receives archives through, its own accounts as
# soon as root creates them (ops/AUTO-DEPLOY.md, "Separate the environments on
# the VPS"). Until then both environments share the deploy account.
APP_USER="aurevia-$DEPLOY_ENVIRONMENT"
INGEST_USER="aurevia-ci-$DEPLOY_ENVIRONMENT"
getent passwd "$APP_USER" >/dev/null || APP_USER="deploy"
getent passwd "$INGEST_USER" >/dev/null || INGEST_USER="deploy"
APP_GROUP="$(id -gn "$APP_USER")"
APP_HOME="$(getent passwd "$APP_USER" | cut -d: -f6)"
INBOX_ROOT="$(getent passwd "$INGEST_USER" | cut -d: -f6)/aurevia-incoming"
RELEASES_ROOT="$APP_ROOT/releases"
CURRENT_LINK="$APP_ROOT/current"
PREVIOUS_RELEASE=""
RELEASE_DIR=""
REMOVE_RELEASE=false

ARCHIVE_SOURCE="$(readlink -f -- "$ARCHIVE_INPUT")"
CHECKSUM_SOURCE="$(readlink -f -- "$ARCHIVE_INPUT.sha256")"

# The sudo rule and this check pin the archive to the environment's own inbox
# and name, so one environment's upload can never be deployed to the other.
if [[ "$(dirname -- "$ARCHIVE_SOURCE")" != "$INBOX_ROOT" ||
  "$(basename -- "$ARCHIVE_SOURCE")" != "$DEPLOY_ENVIRONMENT"-*.tar.gz ]]; then
  echo "Archive must be a $DEPLOY_ENVIRONMENT-*.tar.gz file in $INBOX_ROOT." >&2
  exit 1
fi

if [[ "$(dirname -- "$CHECKSUM_SOURCE")" != "$INBOX_ROOT" || "$CHECKSUM_SOURCE" != *.tar.gz.sha256 ]]; then
  echo "Checksum must resolve inside $INBOX_ROOT." >&2
  exit 1
fi

if [[ ! -f "$CHECKSUM_SOURCE" ]]; then
  echo "Missing checksum: $ARCHIVE_INPUT.sha256" >&2
  exit 1
fi

install -d -o root -g root -m 0700 "$LOCK_DIR" "$LOG_DIR"
LOG_FILE="$(mktemp --suffix=.log "$LOG_DIR/$DEPLOY_ENVIRONMENT-$(date -u +%Y%m%d-%H%M%S)-${REVISION:0:12}-XXXXXX")"
find "$LOG_DIR" -maxdepth 1 -type f -name '*.log' -mtime +30 -delete

# A dropped SSH connection must not stop a deployment halfway, for example
# after the symlink switch but before the health check and rollback. Hangups
# and broken pipes are ignored, and tee keeps writing the log after the client
# disconnects.
trap '' HUP PIPE
exec </dev/null > >(tee -p -a -- "$LOG_FILE") 2>&1
echo "Deployment log: $LOG_FILE"

WORK_DIR="$(mktemp -d /var/tmp/aurevia-deploy.XXXXXX)"
ARCHIVE="$WORK_DIR/release.tar.gz"
chown "root:$APP_GROUP" "$WORK_DIR"
chmod 0750 "$WORK_DIR"

# The inbox belongs to the ingest account, which can swap a checked path for a
# symlink at any moment. Every inbox access therefore runs as that account, so
# a swap can only reach files it could already read or delete. A release that
# never went live is removed as well.
cleanup() {
  if [[ "$REMOVE_RELEASE" == "true" && -n "$RELEASE_DIR" ]]; then
    rm -rf -- "$RELEASE_DIR"
  fi
  runuser -u "$INGEST_USER" -- rm -f -- "$ARCHIVE_SOURCE" "$CHECKSUM_SOURCE" || true
  rm -rf -- "${WORK_DIR:?}"
}
trap cleanup EXIT

runuser -u "$INGEST_USER" -- cat -- "$ARCHIVE_SOURCE" > "$ARCHIVE"
chown "root:$APP_GROUP" "$ARCHIVE"
chmod 0640 "$ARCHIVE"
EXPECTED_HASH="$(runuser -u "$INGEST_USER" -- head -c 4096 -- "$CHECKSUM_SOURCE" | awk 'NR == 1 { print $1 }')"
ACTUAL_HASH="$(sha256sum "$ARCHIVE" | awk '{ print $1 }')"

if [[ ! "$EXPECTED_HASH" =~ ^[0-9a-f]{64}$ || "$ACTUAL_HASH" != "$EXPECTED_HASH" ]]; then
  echo "Release checksum validation failed." >&2
  exit 1
fi

check_release_archive "$ARCHIVE"

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

exec 9>"$LOCK_DIR/$DEPLOY_ENVIRONMENT.lock"
if ! flock -w 300 9; then
  echo "Timed out waiting for the $DEPLOY_ENVIRONMENT deployment lock." >&2
  exit 1
fi

TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"

if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS_RELEASE="$(readlink -f -- "$CURRENT_LINK")"
fi

install -d -o "$APP_USER" -g "$APP_GROUP" -m 0750 "$RELEASES_ROOT"
check_free_space "$ARCHIVE" "$RELEASES_ROOT"

# The runtime account creates the directory under an unpredictable name, so
# root never chowns or writes inside a tree that account controls.
RELEASE_DIR="$(runuser -u "$APP_USER" -- mktemp -d "$RELEASES_ROOT/$TIMESTAMP-${REVISION:0:12}.XXXXXX")"
if [[ ! "$RELEASE_DIR" =~ ^"$RELEASES_ROOT/$TIMESTAMP-${REVISION:0:12}."[A-Za-z0-9]{6}$ ]]; then
  echo "Unexpected release directory: $RELEASE_DIR" >&2
  RELEASE_DIR=""
  exit 1
fi
REMOVE_RELEASE=true
runuser -u "$APP_USER" -- chmod 0750 "$RELEASE_DIR"

runuser -u "$APP_USER" -- tar \
  --extract \
  --gzip \
  --file "$ARCHIVE" \
  --directory "$RELEASE_DIR" \
  --no-same-owner \
  --no-same-permissions \
  --no-overwrite-dir
printf '%s\n' "$REVISION" | runuser -u "$APP_USER" -- tee -- "$RELEASE_DIR/.revision" >/dev/null
printf '%s\n' "$DEPLOY_ENVIRONMENT" | runuser -u "$APP_USER" -- tee -- "$RELEASE_DIR/.environment" >/dev/null

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

# One PM2 cluster worker: `pm2 reload` starts the new worker and waits until it
# listens before stopping the old one, so the port never goes dark. A process
# that is missing, or still in fork mode from older deploys, is (re)started once.
restart_release() {
  local revision="$1" description="" exists=false

  if description="$(run_pm2 "$revision" describe "$PROCESS_NAME" 2>/dev/null)"; then
    exists=true
  fi

  if [[ "$exists" == "true" ]] && grep -Eq 'exec mode[^a-z]+cluster_mode' <<<"$description"; then
    run_pm2 "$revision" reload "$PROCESS_NAME" --update-env || return 1
  else
    if [[ "$exists" == "true" ]]; then
      run_pm2 "$revision" delete "$PROCESS_NAME" || return 1
    fi

    run_pm2 "$revision" start "$CURRENT_LINK/server.js" \
      --name "$PROCESS_NAME" \
      --cwd "$CURRENT_LINK" \
      --instances 1 \
      --exec-mode cluster \
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

port_in_use() {
  (exec 3<>"/dev/tcp/127.0.0.1/$PORT") 2>/dev/null
}

# Another account's process on the port (for example the old one right after an
# environment moves to its own runtime account) would keep serving the old
# release and fail the new one's start. Refuse before switching anything.
if ! run_pm2 "$REVISION" describe "$PROCESS_NAME" >/dev/null 2>&1 && port_in_use; then
  echo "Port $PORT is in use, but $APP_USER's PM2 does not run $PROCESS_NAME. Stop the other process first." >&2
  exit 1
fi

NEXT_LINK="$APP_ROOT/current.next.$$"
ln -sfT -- "$RELEASE_DIR" "$NEXT_LINK"
REMOVE_RELEASE=false
mv -Tf -- "$NEXT_LINK" "$CURRENT_LINK"

DEPLOYMENT_FAILED=false

if ! restart_release "$REVISION" || ! health_check "$REVISION"; then
  DEPLOYMENT_FAILED=true
fi

if [[ "$DEPLOYMENT_FAILED" == "true" ]]; then
  echo "Health check failed for $DEPLOY_ENVIRONMENT revision $REVISION; rolling back." >&2

  if [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
    PREVIOUS_REVISION="unknown"
    CANDIDATE_REVISION="$(timeout 5 runuser -u "$APP_USER" -- head -c 64 -- "$PREVIOUS_RELEASE/.revision" 2>/dev/null | tr -d '\r\n' || true)"
    if [[ "$CANDIDATE_REVISION" =~ ^[0-9a-f]{40}$ ]]; then
      PREVIOUS_REVISION="$CANDIDATE_REVISION"
    fi

    ROLLBACK_LINK="$APP_ROOT/current.rollback.$$"
    ln -sfT -- "$PREVIOUS_RELEASE" "$ROLLBACK_LINK"
    mv -Tf -- "$ROLLBACK_LINK" "$CURRENT_LINK"

    if ! restart_release "$PREVIOUS_REVISION" || ! basic_health_check; then
      echo "Automatic rollback also failed; inspect PM2 and Nginx immediately. The failed release is kept at $RELEASE_DIR." >&2
    else
      echo "Automatic rollback restored $PREVIOUS_RELEASE." >&2
      rm -rf -- "$RELEASE_DIR"
    fi
  else
    run_pm2 "$REVISION" delete "$PROCESS_NAME" >/dev/null 2>&1 || true
    run_pm2 "$REVISION" save >/dev/null 2>&1 || true
    rm -f -- "$CURRENT_LINK"
    rm -rf -- "$RELEASE_DIR"
  fi

  exit 1
fi

# Retention never removes the live release or the one a rollback would use, and
# a failure here does not fail a healthy deployment.
while IFS= read -r release; do
  rm -rf -- "${RELEASES_ROOT:?}/$release" || echo "Could not remove old release $release." >&2
done < <(prunable_releases "$RELEASES_ROOT" "$KEEP_RELEASES" "$RELEASE_DIR" "$PREVIOUS_RELEASE")

echo "Deployment healthy: environment=$DEPLOY_ENVIRONMENT revision=$REVISION release=$RELEASE_DIR"
