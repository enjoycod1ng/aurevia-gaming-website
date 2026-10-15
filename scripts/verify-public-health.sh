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

WORK="$(mktemp -d)"
trap 'rm -rf -- "$WORK"' EXIT
BODY="$WORK/body"
HEADERS="$WORK/headers"
ERRORS="$WORK/errors"

response=""
status=""
# Consecutive Cloudflare challenges. Any other answer resets the count.
challenged=0
# The app answered through the public path, but not with this deployment.
wrong_deployment=""
for _attempt in {1..12}; do
  : >"$BODY"
  : >"$HEADERS"
  # On a timeout or connection error curl still writes 000 as the status.
  status="$(curl --silent --show-error --max-time 10 --output "$BODY" \
    --dump-header "$HEADERS" --write-out '%{http_code}' \
    -H 'Cache-Control: no-cache' "$BASE_URL/api/health?ts=$(date +%s)" 2>"$ERRORS")" || true
  response="$(head -c 2000 "$BODY" 2>/dev/null || true)"

  if [[ "$status" == "200" ]] &&
    grep -Fq '"status":"ok"' <<<"$response" &&
    grep -Fq "\"environment\":\"$DEPLOY_ENVIRONMENT\"" <<<"$response" &&
    grep -Fq "\"revision\":\"$REVISION\"" <<<"$response"; then
    echo "Public health verified: $BASE_URL serves $DEPLOY_ENVIRONMENT $REVISION."
    exit 0
  fi

  # Cloudflare's bot protection challenges GitHub-hosted runners (datacenter IPs)
  # before the request reaches Nginx, and marks that answer with cf-mitigated.
  # A challenge says nothing about the deployment, which the VPS helper already
  # health-checked. Other 403s (a WAF block rule, an Nginx deny) are failures.
  if grep -Eqi '^cf-mitigated:[[:space:]]*challenge' "$HEADERS"; then
    challenged=$((challenged + 1))
  else
    challenged=0
    if grep -Fq '"service":"aurevia-gaming"' <<<"$response"; then
      wrong_deployment="${response:0:300}"
    fi
  fi

  # Never pass on challenges once the app has answered with another deployment:
  # that points at a stale process, a wrong upstream or an old origin.
  if ((challenged >= 3)) && [[ -z "$wrong_deployment" ]]; then
    echo "::warning::Cloudflare challenged this runner, so the public path could not be checked from GitHub. The origin health check passed; open $BASE_URL/api/health in a browser and confirm it reports $DEPLOY_ENVIRONMENT $REVISION."
    exit 0
  fi

  sleep 5
done

error="$(head -c 300 "$ERRORS" 2>/dev/null || true)"
echo "::error::$BASE_URL/api/health did not report $DEPLOY_ENVIRONMENT $REVISION through the public path (HTTP ${status:-none}).${error:+ curl: $error}${wrong_deployment:+ The app answered with: $wrong_deployment} Last response: ${response:0:300}" >&2
exit 1
