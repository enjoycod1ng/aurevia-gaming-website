#!/usr/bin/env bash
set -Eeuo pipefail

ARCHIVE="${1:-}"
APP_ROOT="${APP_ROOT:-/var/www/aurevia-gaming}"
APP_USER="${APP_USER:-aurevia}"
APP_GROUP="${APP_GROUP:-aurevia}"
SERVICE_NAME="${SERVICE_NAME:-aurevia-gaming}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
RELEASE_DIR="$APP_ROOT/releases/$TIMESTAMP"
CURRENT_LINK="$APP_ROOT/current"

if [[ -z "$ARCHIVE" || ! -f "$ARCHIVE" ]]; then
  echo "Usage: sudo bash ops/deploy-release.sh /path/to/aurevia-gaming-*.tar.gz"
  exit 1
fi

install -d -o "$APP_USER" -g "$APP_GROUP" "$APP_ROOT/releases"
install -d -o "$APP_USER" -g "$APP_GROUP" "$RELEASE_DIR"

tar -xzf "$ARCHIVE" -C "$RELEASE_DIR"
chown -R "$APP_USER:$APP_GROUP" "$RELEASE_DIR"

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current.next"
mv -Tf "$APP_ROOT/current.next" "$CURRENT_LINK"

systemctl restart "$SERVICE_NAME"

for attempt in {1..20}; do
  if curl --fail --silent --show-error http://127.0.0.1:3000/api/health >/dev/null; then
    echo "Deployment healthy: $RELEASE_DIR"
    break
  fi

  if [[ "$attempt" -eq 20 ]]; then
    echo "Health check failed. Inspect: journalctl -u $SERVICE_NAME -n 100 --no-pager"
    exit 1
  fi

  sleep 1
done

mapfile -t old_releases < <(
  find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r | tail -n "+$((KEEP_RELEASES + 1))"
)

for release in "${old_releases[@]:-}"; do
  [[ -n "$release" ]] && rm -rf "$APP_ROOT/releases/$release"
done
