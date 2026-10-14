# GitHub auto-deploy operations

The protected release flow is:

```text
feature branch -> pull request -> dev -> staging -> reviewed, approved merge commit -> master -> production
```

| Branch | Domain | App root | Port | PM2 process |
| --- | --- | --- | ---: | --- |
| `dev` | `staging.aureviagaming.com` | `/var/www/aurevia-gaming-staging` | 3001 | `aurevia-gaming-staging` |
| `master` | `aureviagaming.com` | `/var/www/aurevia-gaming` | 3000 | `aurevia-gaming` |

Only `dev` deploys to staging and only `master` deploys to production. Every
production change is the exact code that already ran on staging:

1. A pull request into `dev` passes CI and is merged.
2. The staging workflow deploys `dev`, posts the `policy/dev-to-master` status on
   that commit and opens or refreshes the `dev -> master` promotion PR.
3. The owner reviews and approves the promotion PR, then merges it with
   **Create a merge commit**. Auto-merge is disabled; squash and rebase are not
   allowed on `master`.
4. The production workflow refuses any commit that is not such a merge commit,
   whose tree differs from its staged `dev` parent, or whose parent lacks a
   successful `policy/dev-to-master` status (`scripts/verify-promotion.sh`).
5. The production environment waits for the owner to approve the deployment,
   then builds, deploys and health-checks the exact revision.

Workflow files can be edited on any branch, so the guards in them are defense
in depth. The enforcing controls live in GitHub and on the VPS:

| Control | Where | Enforces |
| --- | --- | --- |
| `production` environment: deployment branch `master` only, required reviewer | GitHub | No other branch can read production secrets or deploy production |
| `staging` environment: deployment branch `dev` only | GitHub | No other branch can read staging secrets or deploy staging |
| `master: reviewed promotions only` ruleset | GitHub | PR required, one code-owner approval, staging checks, merge commits only, no force push, deletion or bypass |
| Auto-merge disabled | GitHub | A promotion merges only when a person merges it |
| One SSH key per environment, pinned to `aurevia-ssh-gate` | VPS | The staging key can never deploy production |

Apply the GitHub settings with an admin GitHub CLI session and re-run it after
any settings change; it is idempotent:

```bash
bash ops/configure-github-protection.sh enjoycod1ng/aurevia-gaming-website enjoycod1ng
```

The ruleset requires code-owner approval of promotion PRs, which are opened by
`github-actions[bot]`, so a solo owner can approve them. It intentionally
leaves "approval of the most recent push" off: the owner's own merge into `dev`
is that push, and the setting would block their approval. If master also has a
classic branch protection rule, review it and delete it once the ruleset is
active; GitHub combines both.

Merge pull requests into `dev` with a merge commit as well, so `dev` keeps
`master` in its history. After a squash merge, the promotion PR reports that
`dev` is out of date; use **Update branch**, let staging redeploy, then merge.

Do not deploy production from any other branch, and never use a manual
production dispatch to publish unmerged work. If production needs an urgent
fix, merge it into `dev`, let staging verify it and promote it normally.

## One-time VPS bootstrap

Run these commands from a reviewed checkout using the existing `deploy`
account with sudo access. Do not let a GitHub Actions job overwrite the
root-owned deployment helper.

```bash
sudo install -o root -g root -m 0755 ops/deploy-release.sh /usr/local/sbin/aurevia-deploy
sudo install -o root -g root -m 0440 ops/aurevia-deploy.sudoers /etc/sudoers.d/aurevia-deploy
sudo visudo -cf /etc/sudoers.d/aurevia-deploy

sudo install -d -o deploy -g deploy -m 0700 /home/deploy/aurevia-incoming
sudo install -d -o deploy -g deploy -m 0750 /var/www/aurevia-gaming/releases
sudo install -d -o deploy -g deploy -m 0750 /var/www/aurevia-gaming-staging/releases
sudo install -d -o root -g root -m 0755 /etc/aurevia-gaming

sudo install -o deploy -g deploy -m 0600 ops/staging.env.example /etc/aurevia-gaming/staging.env
sudoedit /etc/aurevia-gaming/staging.env
```

Create a temporary HTTP site and issue a Let's Encrypt certificate for the
staging hostname, then install the final Nginx site. The DNS record must already
resolve to this server so Certbot can complete its HTTP challenge:

```bash
sudo tee /etc/nginx/sites-available/aurevia-gaming-staging >/dev/null <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name staging.aureviagaming.com;
    return 404;
}
NGINX
sudo ln -sfn /etc/nginx/sites-available/aurevia-gaming-staging /etc/nginx/sites-enabled/aurevia-gaming-staging
sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx \
  -d staging.aureviagaming.com \
  --non-interactive \
  --redirect \
  --cert-name staging.aureviagaming.com
sudo install -o root -g root -m 0644 ops/nginx-staging.conf /etc/nginx/sites-available/aurevia-gaming-staging
sudo ln -sfn /etc/nginx/sites-available/aurevia-gaming-staging /etc/nginx/sites-enabled/aurevia-gaming-staging
sudo nginx -t
sudo systemctl reload nginx
```

Create one Actions key per environment, without a passphrase, and pin each to
the deploy gate. Store each private key only in its own GitHub environment.
Keep the administrator key separate. See [Per-environment deploy keys](#per-environment-deploy-keys).

## GitHub environments

Create `staging` and `production` environments. Configure these secrets in each
environment, never as repository secrets, which every branch can read:

- `VPS_HOST`: the DNS-hidden origin address.
- `VPS_PORT`: SSH port, normally `22`.
- `VPS_USER`: `deploy`.
- `VPS_SSH_KEY`: that environment's own Actions private key.
- `VPS_KNOWN_HOSTS`: pinned `ssh-keyscan` output verified against the existing
  administrator connection.

Configure the public build variables:

| Environment | Variable | Value |
| --- | --- | --- |
| staging | `SITE_URL` | `https://staging.aureviagaming.com` |
| staging | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Staging Turnstile site key |
| production | `SITE_URL` | `https://aureviagaming.com` |
| production | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Production Turnstile site key |
| production | `NEXT_PUBLIC_GA_ID` | Production GA4 measurement ID |
| both | `VPS_DEPLOY_PROTOCOL` | `gated` once that environment's key is pinned to the gate; unset means `legacy` |

Runtime-only Turnstile, webhook, Telegram and bearer secrets remain in the VPS
environment files and are never stored in the repository.

## Cloudflare staging

1. Create a managed Turnstile widget restricted to
   `staging.aureviagaming.com`.
2. Validate the origin before DNS is published:

   ```bash
   curl --resolve staging.aureviagaming.com:443:ORIGIN_IP \
     https://staging.aureviagaming.com/api/health
   ```

3. Add a proxied `A` record named `staging` pointing to the existing origin.

The staging site is public. The staging build sets `APP_ENV=staging`, emits a
disallowing `robots.txt`, and sends
`X-Robots-Tag: noindex, nofollow, noarchive` on every response. These directives
discourage indexing but are not access controls; do not place confidential data
on staging.

## Deployment and rollback

The workflow builds the standalone artifact once and smoke-tests the extracted
archive, including native image optimization, before it sends it to the VPS.
With `VPS_DEPLOY_PROTOCOL=gated`, `scripts/deploy-vps.sh` streams the archive
over one SSH connection:

```bash
ssh deploy@HOST "staging COMMIT_SHA ARCHIVE_SHA256" < ARCHIVE.tar.gz
```

The key's forced command, `/usr/local/sbin/aurevia-ssh-gate`, checks that the
requested environment matches the one pinned in `authorized_keys`, stores the
archive and checksum in the inbox and runs the helper for the pinned
environment only. The legacy protocol uploads the archive and checksum with
`scp` and calls the helper directly:

```bash
sudo /usr/local/sbin/aurevia-deploy staging /home/deploy/aurevia-incoming/ARCHIVE.tar.gz COMMIT_SHA
```

Both workflows queue deployments instead of cancelling a running one. The helper validates all inputs, serializes deployments with `flock`, switches
the `current` symlink atomically, verifies the environment and exact revision
through `/api/health`, retains five releases, and automatically restores the
previous symlink if startup or health validation fails. The staging workflow
uses this check as its deployment health gate; it does not require Cloudflare
Access credentials.

For manual recovery, inspect the current and retained releases before changing
anything:

```bash
readlink -f /var/www/aurevia-gaming/current
ls -1dt /var/www/aurevia-gaming/releases/*
pm2 status
pm2 logs aurevia-gaming --lines 100
```

## Per-environment deploy keys

Until this cutover, staging and production share one key with a shell on the
VPS, so anything that can use the staging secrets can also deploy production.
Do the cutover from the root or administrator console, staging first.

1. Install the gate from a reviewed checkout of `master`:

   ```bash
   sudo install -o root -g root -m 0755 ops/aurevia-ssh-gate.sh /usr/local/sbin/aurevia-ssh-gate
   ```

2. Generate a key for the environment on a trusted machine:

   ```bash
   ssh-keygen -t ed25519 -N '' -C github-actions-staging -f aurevia-staging-deploy
   ```

3. Append its public key to `/home/deploy/.ssh/authorized_keys`, pinned to the
   gate. Every option before the key is required:

   ```text
   restrict,command="/usr/local/sbin/aurevia-ssh-gate staging" ssh-ed25519 AAAA... github-actions-staging
   ```

4. Replace `VPS_SSH_KEY` in the `staging` environment with the new private key,
   set the `staging` environment variable `VPS_DEPLOY_PROTOCOL=gated`, and
   delete the private key file from the trusted machine.
5. Re-run the latest staging deployment and confirm it reports the exact
   revision. A failed run changes nothing on the VPS; unset the variable to
   return to the legacy protocol while you investigate.
6. Repeat steps 2-5 for `production` with `-C github-actions-production` and
   `command="/usr/local/sbin/aurevia-ssh-gate production"`. The production
   re-run waits for the reviewer's approval.
7. Remove the old shared key's line from `authorized_keys`. Confirm the new
   keys have no shell:

   ```bash
   ssh -i aurevia-staging-deploy deploy@HOST id   # prints the gate's usage and exits 1
   ```

After the cutover, `legacy` support in `scripts/deploy-vps.sh` can be removed.

## Key rotation

1. Generate a replacement key for one environment and authorize it with the same
   pinned `restrict,command=...` options.
2. Replace `VPS_SSH_KEY` in that GitHub environment only.
3. Run that environment's deployment and verify its revision.
4. Remove the old public key from `authorized_keys`.
