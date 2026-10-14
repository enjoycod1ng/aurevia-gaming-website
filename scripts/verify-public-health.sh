#!/usr/bin/env bash
set -Eeuo pipefail

# The VPS helper health-checks the app on 127.0.0.1. This checks the path
# visitors use (Cloudflare -> Nginx -> app) and that it serves the new revision.
#
#   bash scripts/verify-public-health.sh https://staging.aureviagaming.com staging <sha>

BASE_URL="${1:-}"
DEPLOY_ENVIRONMENT="${2:-}"
REVISION="${3:-}"

if [[ ! "$BASE_URL" =~ ^https://[a-z0-9.-]+$ ||
  ! "$DEPLOY_ENVIRONMENT" =~ ^(staging|production)$ ||
  ! "$REVISION" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Usage: verify-public-health.sh https://host <staging|production> <40-character-git-sha>" >&2
  exit 1
fi

response=""
for _attempt in {1..12}; do
  if response="$(curl --fail --silent --show-error --max-time 10 \
    -H 'Cache-Control: no-cache' "$BASE_URL/api/health?ts=$(date +%s)" 2>&1)" &&
    grep -Fq '"status":"ok"' <<<"$response" &&
    grep -Fq "\"environment\":\"$DEPLOY_ENVIRONMENT\"" <<<"$response" &&
    grep -Fq "\"revision\":\"$REVISION\"" <<<"$response"; then
    echo "Public health verified: $BASE_URL serves $DEPLOY_ENVIRONMENT $REVISION."
    exit 0
  fi
  sleep 5
done

echo "::error::$BASE_URL/api/health did not report $DEPLOY_ENVIRONMENT $REVISION through the public path. Last response: ${response:0:300}" >&2
exit 1
