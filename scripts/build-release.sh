#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_ROOT="$PROJECT_ROOT/release"
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

bash "$PROJECT_ROOT/scripts/package-release.sh" "$ARCHIVE"
