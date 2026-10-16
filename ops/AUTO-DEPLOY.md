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
   It checks this before it builds and again before it deploys.
5. The production workflow builds the exact revision, then the production
   environment waits for the owner to approve the deployment before it deploys
   and health-checks that build.

Workflow files can be edited on any branch, so the guards in them are defense
in depth. The enforcing controls live in GitHub and on the VPS:

| Control | Where | Enforces |
| --- | --- | --- |
| `production` environment: deployment branch `master` only, required reviewer | GitHub | No other branch can read production secrets or deploy production |
| `staging` environment: deployment branch `dev` only | GitHub | No other branch can read staging secrets or deploy staging |
| `master: reviewed promotions only` ruleset | GitHub | PR required, one code-owner approval, staging checks, merge commits only, no force push, deletion or bypass |
| Auto-merge disabled | GitHub | A promotion merges only when a person merges it |
| One SSH key per environment, pinned to `aurevia-ssh-gate` | VPS | The staging key can never deploy production |
| One runtime account and one CI account per environment | VPS | A compromised staging site or CI account cannot touch production ([setup](#separate-the-environments-on-the-vps)) |

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

Feature pull requests into `dev` may be squashed. Promotions must not be: with
a merge commit, the next promotion's merge base is the previously promoted
`dev` commit and it merges cleanly. A squashed promotion leaves `master` with a
commit `dev` lacks, the production workflow refuses to deploy it, and the next
promotion conflicts. To recover, merge `master` into `dev` without changing any
files (`git merge -s ours origin/master` on a branch from `dev`), merge that
pull request into `dev` with **Create a merge commit**, and promote again.

Do not deploy production from any other branch, and never use a manual
production dispatch to publish unmerged work. If production needs an urgent
fix, merge it into `dev`, let staging verify it and promote it normally.

## One-time VPS bootstrap

Run these commands from a reviewed checkout as an administrator account other
than `deploy`, which has no general sudo access. Do not let a GitHub Actions job
overwrite the root-owned deployment helper.

```bash
sudo install -o root -g root -m 0755 ops/deploy-release.sh /usr/local/sbin/aurevia-deploy
sudo visudo -cf ops/aurevia-deploy.sudoers
sudo install -o root -g root -m 0440 ops/aurevia-deploy.sudoers /etc/sudoers.d/aurevia-deploy

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
- `VPS_USER`: `deploy`, or the environment's own CI account once it exists
  (`aurevia-ci-staging` / `aurevia-ci-production`).
- `VPS_SSH_KEY`: that environment's own Actions private key.
- `VPS_KNOWN_HOSTS`: pinned `ssh-keyscan` output verified against the existing
  administrator connection.

The environments need no variables. The public build settings are compiled
into the site, so they are not secret, and the build job has no environment to
read variables from. They live in the `env` block at the top of each deploy
workflow and change through a reviewed pull request like any other code:

| Setting | `deploy-staging.yml` | `deploy-production.yml` |
| --- | --- | --- |
| `SITE_URL` | `https://staging.aureviagaming.com` | `https://aureviagaming.com` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Staging Turnstile site key | Production Turnstile site key |
| `NEXT_PUBLIC_GA_ID` | Empty | Production GA4 measurement ID, once there is one |
| `NEXT_PUBLIC_DEMO_RUNTIME_ORIGIN` | `https://play.aureviagaming.com` ([ORIGIN-HARDENING.md](ORIGIN-HARDENING.md), step 6) | Same |

The deploy job refuses to deploy while an environment variable with one of these
names holds a different value, so a value changed in the GitHub settings is never
ignored silently. Delete such variables, or keep them identical.

Runtime-only Turnstile, webhook, Telegram and bearer secrets remain in the VPS
environment files and are never stored in the repository. `NEXT_PUBLIC_*`
values in those files have no effect: the browser code is compiled in GitHub
Actions, so a GA4 measurement ID placed in `/etc/aurevia-gaming/production.env`
never reaches the site. Set it in `deploy-production.yml` instead.

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

Each deploy workflow runs two jobs, so that code from npm packages never runs
where the deploy key is:

- The build job has no environment and no secrets. It installs the locked
  dependencies, type-checks, tests, lints and builds, packages the standalone
  archive once and smoke-tests the extracted archive, including native image
  optimization. It uploads the archive and its checksum as a workflow artifact
  and records the checksum as a job output. The repository is public, so anyone
  signed in to GitHub can download that artifact: never give this job a secret.
- The deploy job is bound to the environment and holds its secrets. It checks
  out only the scripts it runs and never installs or runs npm packages. It
  downloads the artifact, checks it against the checksum the build job recorded
  and sends it to the VPS with `scripts/deploy-vps.sh`, then checks the public
  URL with `scripts/verify-public-health.sh`.

`scripts/deploy-vps.sh` streams the archive over one SSH connection:

```bash
ssh deploy@HOST "staging COMMIT_SHA ARCHIVE_SHA256" < ARCHIVE.tar.gz
```

The key's forced command, `/usr/local/sbin/aurevia-ssh-gate`, checks that the
requested environment matches the one pinned in `authorized_keys`, stores the
archive and checksum in the account's inbox and runs the helper for the pinned
environment only:

```bash
sudo -n /usr/local/sbin/aurevia-deploy staging /home/deploy/aurevia-incoming/staging-NAME.tar.gz COMMIT_SHA
```

The sudo rule only accepts an archive named for the environment it deploys. A
key without the forced command fails with exit 127 and a hint, and nothing on
the VPS changes.

Both workflows queue deployments instead of cancelling a running one. The
helper:

- validates all inputs and refuses archives that contain anything but regular
  files and directories (no symlinks, hard links or devices), absolute paths or
  `..`. `scripts/package-release.sh` enforces the same rule when it builds;
- checks that the unpacked release fits on disk with 256 MiB to spare;
- serializes deployments with `flock` on a lock in the root-only
  `/run/aurevia-deploy`;
- unpacks, as the runtime account, into a new randomly named release directory
  and writes `.revision` and `.environment` as that account, never as root;
- switches the `current` symlink atomically and verifies the environment and
  exact revision through `/api/health`;
- restores the previous release if startup or health validation fails, then
  deletes the failed release (it is kept only if the rollback fails too);
- keeps the five newest releases, and never deletes the live release or the one
  a rollback would use;
- keeps going if the SSH connection drops. Every run is logged to
  `/var/log/aurevia-deploy/` (kept for 30 days), and the client sees the same
  output while it is connected. A retried upload waits for the running
  deployment and then deploys the same revision again.

The staging workflow uses this check as its deployment health gate; it does not
require Cloudflare Access credentials.

For manual recovery, inspect the current and retained releases and the latest
deployment log before changing anything:

```bash
readlink -f /var/www/aurevia-gaming/current
ls -1dt /var/www/aurevia-gaming/releases/*
sudo ls -1t /var/log/aurevia-deploy | head
pm2 status
pm2 logs aurevia-gaming --lines 100
```

Run `pm2` as the environment's runtime account (`deploy` until the accounts
below exist, then `sudo -u aurevia-production -H pm2 ...`).

## Per-environment deploy keys

Each GitHub environment deploys with its own key, pinned to the gate, so
anything that can use the staging secrets still cannot deploy production. No key
has a shell on the VPS, and `scripts/deploy-vps.sh` has no other way to deploy.
To set up the keys on a new VPS, or to replace a lost one, work from the root or
administrator console, staging first:

1. Install the gate from a reviewed checkout of `master`:

   ```bash
   sudo install -o root -g root -m 0755 ops/aurevia-ssh-gate.sh /usr/local/sbin/aurevia-ssh-gate
   ```

2. Generate a key for the environment on a trusted machine:

   ```bash
   ssh-keygen -t ed25519 -N '' -C github-actions-staging -f aurevia-staging-deploy
   ```

3. Append its public key to the `authorized_keys` of the account in
   `VPS_USER`: `/home/deploy/.ssh/authorized_keys`, or the environment's CI
   account once it exists ([CI accounts](#ci-accounts-and-per-environment-sudo-rules)).
   Pin it to the gate. Every option before the key is required:

   ```text
   restrict,command="/usr/local/sbin/aurevia-ssh-gate staging" ssh-ed25519 AAAA... github-actions-staging
   ```

4. Replace `VPS_SSH_KEY` in the `staging` environment with the new private key.
5. Re-run the latest staging deployment and confirm it reports the exact
   revision. A failed run changes nothing on the VPS; exit 127 means the key's
   line lacks the forced command. Then confirm the key has no shell and delete
   the private key file from the trusted machine:

   ```bash
   ssh -i aurevia-staging-deploy deploy@HOST id   # prints the gate's usage and exits 1
   rm aurevia-staging-deploy
   ```

6. Repeat steps 2-5 for `production` with `-C github-actions-production` and
   `command="/usr/local/sbin/aurevia-ssh-gate production"`. The production
   re-run waits for the reviewer's approval.

## Separate the environments on the VPS

The pinned keys stop the staging key from deploying production, but both sites
still run as `deploy`, which also owns both release trees, the inbox,
`~/.ssh/authorized_keys` and the sudo rules for both environments. Code running
in the staging site could therefore rewrite production's files, add an SSH key
or deploy production. The fix is two accounts per environment:

| | Staging | Production |
| --- | --- | --- |
| Runtime account: runs the site with its own PM2, owns its releases | `aurevia-staging` | `aurevia-production` |
| CI account: holds the pinned key, the inbox and the sudo rule | `aurevia-ci-staging` | `aurevia-ci-production` |

`/usr/local/sbin/aurevia-deploy` picks up each account as soon as root creates
it and uses `deploy` for anything that does not exist yet, so every step below
is a VPS change only. First install the current helper and sudo rules
([One-time VPS bootstrap](#one-time-vps-bootstrap)) and finish
[Per-environment deploy keys](#per-environment-deploy-keys), which installs the
current gate. Do staging before production. Use an administrator account other than `deploy`; once both
environments are moved, `deploy` needs no sudo access at all.

### Runtime accounts

The new accounts cannot use the `nvm` install in `/home/deploy`. Install Node.js
24 and PM2 system-wide (for example Node.js from NodeSource, then
`sudo npm install -g pm2`) and check that a login shell finds both:

```bash
sudo bash -lc 'command -v node pm2'   # both must be in /usr/bin or /usr/local/bin
```

Moving an environment stops its site until the next deployment finishes, so do
production in a quiet period. Hold the environment's deployment lock while you
work so that no deployment starts halfway through (one that arrives meanwhile
waits up to five minutes, then fails without changing anything):

```bash
sudo install -d -o root -g root -m 0700 /run/aurevia-deploy
sudo flock /run/aurevia-deploy/staging.lock bash   # a root shell that holds the lock
```

In that shell:

```bash
useradd --system --user-group --create-home --home-dir /var/lib/aurevia-staging \
  --shell /usr/sbin/nologin aurevia-staging

# Stop the site in deploy's PM2. The helper refuses to start it under the new
# account while another process holds port 3001.
sudo -u deploy -H bash -lc '[ -s ~/.nvm/nvm.sh ] && . ~/.nvm/nvm.sh; pm2 delete aurevia-gaming-staging && pm2 save'

# Releases belong to the runtime account; the app root and current link to root.
chown root:root /var/www/aurevia-gaming-staging
chmod 0755 /var/www/aurevia-gaming-staging
chown -R aurevia-staging:aurevia-staging /var/www/aurevia-gaming-staging/releases
chown root:aurevia-staging /etc/aurevia-gaming/staging.env
chmod 0640 /etc/aurevia-gaming/staging.env

# Start the account's PM2 at boot, as pm2-deploy does for deploy.
pm2 startup systemd -u aurevia-staging --hp /var/lib/aurevia-staging
exit
```

Re-run the latest staging deployment. The helper starts the site under
`aurevia-staging` and saves it for the boot service. Check:

```bash
sudo -u aurevia-staging -H pm2 ls                  # aurevia-gaming-staging, online, fork mode
ps -o user= -p "$(sudo -u aurevia-staging -H pm2 pid aurevia-gaming-staging)"   # aurevia-staging
curl -s http://127.0.0.1:3001/api/health
```

Repeat with `production`, `aurevia-production`, `aurevia-gaming`, port 3000 and
`/var/www/aurevia-gaming`; the production re-run waits for the reviewer. When
`deploy`'s PM2 runs nothing, stop it and its boot service:

```bash
sudo -u deploy -H bash -lc '[ -s ~/.nvm/nvm.sh ] && . ~/.nvm/nvm.sh; pm2 kill'
sudo systemctl disable --now pm2-deploy
```

Keep `/home/deploy` at mode `0750` or stricter so the runtime accounts cannot
read it.

### CI accounts and per-environment sudo rules

Each CI account receives only its environment's uploads and may run only that
environment's deployment. Its sudo rule pins the environment argument and the
archive location, so it works as a per-environment wrapper around the helper
without another root-owned script; the helper also refuses archives outside the
calling environment's own inbox. As soon as `aurevia-ci-staging` exists, the
helper stops accepting staging archives from `deploy`, so finish these steps
in one sitting.

```bash
# sshd runs the forced command through the login shell, so it must be a real
# shell; the account has no password and its key gets no shell. Root owns the
# home directory and the keys, so the account can write only its inbox.
sudo useradd --user-group --no-create-home --home-dir /home/aurevia-ci-staging \
  --shell /bin/bash aurevia-ci-staging
sudo install -d -o root -g root -m 0755 /home/aurevia-ci-staging /home/aurevia-ci-staging/.ssh
sudo install -d -o aurevia-ci-staging -g aurevia-ci-staging -m 0700 /home/aurevia-ci-staging/aurevia-incoming
```

If `sshd_config` restricts logins with `AllowUsers` or `AllowGroups`, add the
CI accounts there.

Move the staging key's `restrict,command="/usr/local/sbin/aurevia-ssh-gate staging" ...`
line from `/home/deploy/.ssh/authorized_keys` into
`/home/aurevia-ci-staging/.ssh/authorized_keys` (owner `root`, mode `0644`).
Then install the sudo rule:

```bash
echo 'aurevia-ci-staging ALL=(root) NOPASSWD: /usr/local/sbin/aurevia-deploy staging /home/aurevia-ci-staging/aurevia-incoming/staging-*.tar.gz *' \
  > aurevia-ci-staging.sudoers
sudo visudo -cf aurevia-ci-staging.sudoers
sudo install -o root -g root -m 0440 aurevia-ci-staging.sudoers /etc/sudoers.d/aurevia-ci-staging
```

Set the `staging` environment secret `VPS_USER=aurevia-ci-staging`, re-run the
latest staging deployment and confirm the revision. Then remove the `staging`
line from `/etc/sudoers.d/aurevia-deploy` with
`sudo visudo -f /etc/sudoers.d/aurevia-deploy`.

Repeat for production. Afterwards `deploy` holds no deploy key and needs no
sudo rule: delete `/etc/sudoers.d/aurevia-deploy`.

## Key rotation

1. Generate a replacement key for one environment and authorize it with the same
   pinned `restrict,command=...` options.
2. Replace `VPS_SSH_KEY` in that GitHub environment only.
3. Run that environment's deployment and verify its revision.
4. Remove the old public key from `authorized_keys`.
