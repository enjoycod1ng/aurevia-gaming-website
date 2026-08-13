# GitHub auto-deploy operations

The protected release flow is:

```text
feature branch -> pull request -> dev -> staging -> approved auto-merge -> master -> production
```

| Branch | Domain | App root | Port | PM2 process |
| --- | --- | --- | ---: | --- |
| `dev` | `staging.aureviagaming.com` | `/var/www/aurevia-gaming-staging` | 3001 | `aurevia-gaming-staging` |
| `master` | `aureviagaming.com` | `/var/www/aurevia-gaming` | 3000 | `aurevia-gaming` |

Direct pushes, force pushes and deletion are disabled on both protected branches.
The `master` rule requires the successful staging deployment, the
`policy/dev-to-master` status and one fresh owner approval.

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

Create a dedicated Actions key without a passphrase. Append only its public key
to `/home/deploy/.ssh/authorized_keys`; store the private key exclusively as a
GitHub Actions secret. Keep the administrator key separate.

## GitHub environments

Create `staging` and `production` environments. Configure these secrets in both:

- `VPS_HOST`: the DNS-hidden origin address.
- `VPS_PORT`: SSH port, normally `22`.
- `VPS_USER`: `deploy`.
- `VPS_SSH_KEY`: dedicated Actions private key.
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

The workflow builds the standalone artifact once, uploads the archive and its
SHA-256 checksum, and calls:

```bash
sudo /usr/local/sbin/aurevia-deploy staging /home/deploy/aurevia-incoming/ARCHIVE.tar.gz COMMIT_SHA
```

The helper validates all inputs, serializes deployments with `flock`, switches
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

## Key rotation

1. Generate and authorize a replacement Actions key.
2. Replace `VPS_SSH_KEY` in both GitHub environments.
3. Run a staging deployment and verify its revision.
4. Remove the old public key from `authorized_keys`.
5. Re-run a production deployment from `master` when desired.
