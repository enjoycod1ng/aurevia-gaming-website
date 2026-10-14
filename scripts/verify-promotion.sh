#!/usr/bin/env bash
set -Eeuo pipefail

# Production may only deploy a master commit whose exact content already ran on
# staging. Promotion PRs are merged with a merge commit, so the second parent is
# the dev commit that staging deployed and marked with policy/dev-to-master, and
# the merged tree must be identical to that commit's tree.

REVISION="${1:-${GITHUB_SHA:-}}"
REPOSITORY="${GITHUB_REPOSITORY:-}"
STATUS_CONTEXT="policy/dev-to-master"

if [[ ! "$REVISION" =~ ^[0-9a-f]{40}$ || -z "$REPOSITORY" ]]; then
  echo "Usage: GITHUB_REPOSITORY=owner/repo verify-promotion.sh <40-character-git-sha>" >&2
  exit 1
fi

if ! STAGED_REVISION="$(git rev-parse --verify --quiet "$REVISION^2")"; then
  echo "::error::$REVISION is not a promotion merge commit. Merge the dev -> master promotion PR with \"Create a merge commit\"; do not push, squash or rebase onto master." >&2
  exit 1
fi

if ! git diff --quiet "$STAGED_REVISION" "$REVISION"; then
  echo "::error::master $REVISION differs from the staged dev commit $STAGED_REVISION. Merge master into dev, let staging redeploy, then merge the refreshed promotion PR." >&2
  exit 1
fi

STATE="$(gh api "repos/$REPOSITORY/commits/$STAGED_REVISION/status" \
  --jq "[.statuses[] | select(.context == \"$STATUS_CONTEXT\") | .state][0] // \"missing\"")"

if [[ "$STATE" != "success" ]]; then
  echo "::error::Staged commit $STAGED_REVISION has no successful $STATUS_CONTEXT status (found: $STATE). Only commits deployed to staging from dev may reach production." >&2
  exit 1
fi

echo "Promotion verified: $REVISION matches dev commit $STAGED_REVISION, which passed staging."
