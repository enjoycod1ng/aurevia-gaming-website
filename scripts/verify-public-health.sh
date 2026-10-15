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

BODY="$(mktemp)"
trap 'rm -f -- "$BODY"' EXIT

response=""
status=""
blocked=0
for _attempt in {1..12}; do
  status="$(curl --silent --show-error --max-time 10 --output "$BODY" --write-out '%{http_code}' \
    -H 'Cache-Control: no-cache' "$BASE_URL/api/health?ts=$(date +%s)" 2>&1)" || true
  response="$(head -c 2000 "$BODY" 2>/dev/null || true)"

  if [[ "$status" == "200" ]] &&
    grep -Fq '"status":"ok"' <<<"$response" &&
    grep -Fq "\"environment\":\"$DEPLOY_ENVIRONMENT\"" <<<"$response" &&
    grep -Fq "\"revision\":\"$REVISION\"" <<<"$response"; then
    echo "Public health verified: $BASE_URL serves $DEPLOY_ENVIRONMENT $REVISION."
    exit 0
  fi

  # Cloudflare's bot protection answers GitHub-hosted runners (datacenter IPs)
  # with 403/429 before the request reaches Nginx. That says nothing about the
  # deployment, which the VPS helper already health-checked, so it only warns.
  if [[ "$status" == "403" || "$status" == "429" ]]; then
    if (( ++blocked >= 3 )); then
      echo "::warning::Cloudflare answered $status to this runner, so the public path could not be checked from GitHub. The origin health check passed; verify $BASE_URL/api/health from a browser, or add a Cloudflare WAF skip rule for /api/health."
      exit 0
    fi
  fi

  sleep 5
done

echo "::error::$BASE_URL/api/health did not report $DEPLOY_ENVIRONMENT $REVISION through the public path (HTTP ${status:-none}). Last response: ${response:0:300}" >&2
exit 1
