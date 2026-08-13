#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_ROOT="$PROJECT_ROOT/release"
DEFAULT_ARCHIVE="$RELEASE_ROOT/aurevia-gaming-$(date -u +%Y%m%d-%H%M%S).tar.gz"
ARCHIVE="${1:-$DEFAULT_ARCHIVE}"

if [[ "$ARCHIVE" != /* ]]; then
  ARCHIVE="$PROJECT_ROOT/$ARCHIVE"
fi

if [[ ! -f "$PROJECT_ROOT/.next/standalone/server.js" ]]; then
  echo "Missing .next/standalone/server.js. Run npm run build first." >&2
  exit 1
fi

mkdir -p "$(dirname "$ARCHIVE")" "$RELEASE_ROOT"
STAGE_DIR="$(mktemp -d "$RELEASE_ROOT/stage.XXXXXX")"
trap 'rm -rf -- "$STAGE_DIR"' EXIT

mkdir -p "$STAGE_DIR/.next"
cp -a "$PROJECT_ROOT/.next/standalone/." "$STAGE_DIR/"
cp -a "$PROJECT_ROOT/.next/static" "$STAGE_DIR/.next/static"
cp -a "$PROJECT_ROOT/public" "$STAGE_DIR/public"

# The image optimizer writes cache files here at runtime.
mkdir -p "$STAGE_DIR/.next/cache/images"

tar -C "$STAGE_DIR" -czf "$ARCHIVE" .
(
  cd "$(dirname "$ARCHIVE")"
  sha256sum "$(basename "$ARCHIVE")" > "$(basename "$ARCHIVE").sha256"
)

echo "Release created: $ARCHIVE"
echo "Checksum created: $ARCHIVE.sha256"
