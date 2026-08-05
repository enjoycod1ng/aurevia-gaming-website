#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_ROOT="$PROJECT_ROOT/release"
STAGE_DIR="$RELEASE_ROOT/stage"
ARCHIVE="$RELEASE_ROOT/aurevia-gaming-$(date -u +%Y%m%d-%H%M%S).tar.gz"

cd "$PROJECT_ROOT"

if [[ -f package-lock.json ]]; then
  npm ci
else
  echo "WARNING: package-lock.json is not present. Running npm install once."
  echo "Commit the generated package-lock.json before the first production release."
  npm install --no-audit --no-fund
fi

npm run typecheck
npm run lint
npm run build

rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/.next"

cp -a .next/standalone/. "$STAGE_DIR/"
cp -a .next/static "$STAGE_DIR/.next/static"
cp -a public "$STAGE_DIR/public"

# The image optimizer writes cache files here at runtime.
mkdir -p "$STAGE_DIR/.next/cache/images"

tar -C "$STAGE_DIR" -czf "$ARCHIVE" .
rm -rf "$STAGE_DIR"

echo "Release created: $ARCHIVE"
