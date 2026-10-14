#!/usr/bin/env bash
set -Eeuo pipefail

# Applies the GitHub settings that enforce the release flow. Workflow guards can
# be edited on any branch; these server-side settings cannot:
#
#   - the production environment accepts only master, after a reviewer approves;
#   - the staging environment accepts only dev;
#   - master changes only through a reviewed, code-owner-approved PR that passed
#     staging and is merged with a merge commit, with no bypass;
#   - auto-merge is disabled.
#
# The ruleset does not require the promotion branch to be up to date: master
# keeps each promotion's merge commit, which dev never contains, and dev rejects
# direct pushes. scripts/verify-promotion.sh enforces the stronger property that
# the deployed tree equals the staged dev commit.
#
# Run it with a GitHub CLI session that has admin rights on the repository. It
# is idempotent and prints anything it cannot fix automatically.
#
#   bash ops/configure-github-protection.sh [owner/repo] [production-reviewer]

REPOSITORY="${1:-enjoycod1ng/aurevia-gaming-website}"
REVIEWER="${2:-enjoycod1ng}"
RULESET_NAME="master: reviewed promotions only"

REVIEWER_ID="$(gh api "users/$REVIEWER" --jq .id)"

echo "Disabling auto-merge for $REPOSITORY"
gh api --method PATCH "repos/$REPOSITORY" -F allow_auto_merge=false >/dev/null

configure_environment() {
  local environment="$1" branch="$2" reviewers="$3"

  echo "Restricting the $environment environment to $branch"
  gh api --method PUT "repos/$REPOSITORY/environments/$environment" --input - >/dev/null <<JSON
{
  "reviewers": $reviewers,
  "prevent_self_review": false,
  "deployment_branch_policy": { "protected_branches": false, "custom_branch_policies": true }
}
JSON

  local policies_path="repos/$REPOSITORY/environments/$environment/deployment-branch-policies"
  local found=false id name type

  while read -r id type name; do
    [[ -n "$id" ]] || continue
    if [[ "$type" == "branch" && "$name" == "$branch" ]]; then
      found=true
    else
      echo "  Removing extra deployment policy: $type $name"
      gh api --method DELETE "$policies_path/$id" >/dev/null
    fi
  done < <(gh api "$policies_path" --jq '.branch_policies[] | "\(.id) \(.type // "branch") \(.name)"')

  if [[ "$found" == "false" ]]; then
    gh api --method POST "$policies_path" -f name="$branch" -f type=branch >/dev/null
  fi
}

configure_environment production master "[{\"type\": \"User\", \"id\": $REVIEWER_ID}]"
configure_environment staging dev "[]"

RULESET="$(cat <<JSON
{
  "name": "$RULESET_NAME",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["refs/heads/master"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "allowed_merge_methods": ["merge"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          { "context": "Deploy staging" },
          { "context": "policy/dev-to-master" }
        ]
      }
    }
  ]
}
JSON
)"

RULESET_ID="$(gh api "repos/$REPOSITORY/rulesets" --paginate \
  --jq ".[] | select(.name == \"$RULESET_NAME\") | .id")"

if [[ -n "$RULESET_ID" ]]; then
  echo "Updating ruleset \"$RULESET_NAME\""
  gh api --method PUT "repos/$REPOSITORY/rulesets/$RULESET_ID" --input - >/dev/null <<<"$RULESET"
else
  echo "Creating ruleset \"$RULESET_NAME\""
  gh api --method POST "repos/$REPOSITORY/rulesets" --input - >/dev/null <<<"$RULESET"
fi

REPOSITORY_SECRETS="$(gh api "repos/$REPOSITORY/actions/secrets" --paginate \
  --jq '.secrets[].name' | grep '^VPS_' || true)"

if [[ -n "$REPOSITORY_SECRETS" ]]; then
  echo "WARNING: repository-level secrets are readable from any branch: $(tr '\n' ' ' <<<"$REPOSITORY_SECRETS")"
  echo "         Keep VPS_* secrets only in the staging and production environments."
fi

if gh api "repos/$REPOSITORY/branches/master/protection" >/dev/null 2>&1; then
  echo "NOTE: master also has a classic branch protection rule. Rules combine, so a"
  echo "      classic 'require approval of the most recent push' setting blocks a solo"
  echo "      owner from approving promotions. Review it under Settings -> Branches and"
  echo "      delete it once the \"$RULESET_NAME\" ruleset is active."
fi

echo "Done. Production now deploys only from master after $REVIEWER approves the deployment."
