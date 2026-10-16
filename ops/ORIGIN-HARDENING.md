# Origin hardening runbook (October 2026)

These are the VPS and backend steps for the fixes in this repository. Each step
can be done separately. Do them in this order, and staging before production
where a step applies to both.

Keep a second SSH session open while changing Nginx or the firewall.

Status on 2026-10-16:

| Step | Status |
| --- | --- |
| 1. Cloudflare-only origin | Done on all three sites |
| 2. Deploy helper | Done |
| 3. Per-environment deploy keys | Done |
| 4. Separate runtime and CI accounts | Not done; only system-wide Node.js and PM2 are installed |
| 5. Portal backend | Done (`png-portal:1.0.1`) |
| 6. Runtime on its own origin | Done; the old runtime path on `aureviagaming.com` returns 404 |

## 1. Accept web traffic only from Cloudflare

Both `aureviagaming.com` and `staging.aureviagaming.com` are proxied by
Cloudflare. Until this step is done, anyone who finds the VPS address can skip
the WAF, bot protection and rate limits, and can set `CF-Connecting-IP` to any
value.

```bash
# Visitor-IP restoration and the $aurevia_from_cloudflare flag (http context).
sudo bash ops/update-cloudflare-ips.sh
# Proxy headers that overwrite every client-supplied address header.
sudo install -d /etc/nginx/snippets
sudo install -m 0644 ops/nginx-proxy-headers.conf /etc/nginx/snippets/aurevia-proxy-headers.conf
```

Staging: install `ops/nginx-staging.conf` as the staging site.

Production: the live server block is not in this repository. Make these three
changes to it, the same way `ops/nginx-staging.conf` does:

1. In the port 443 server block, add:
   ```nginx
   if ($aurevia_from_cloudflare = 0) {
       return 444;
   }
   ```
2. In the port 80 block, keep `/.well-known/acme-challenge/` open and return
   444 for non-Cloudflare traffic everywhere else.
3. In each location that proxies to `127.0.0.1:3000`, replace the
   `proxy_set_header` lines with
   `include /etc/nginx/snippets/aurevia-proxy-headers.conf;`.
   Remove any `X-Real-IP $http_cf_connecting_ip` line: it trusts a header that
   anyone can send.

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sS https://aureviagaming.com/api/health                     # 200 through Cloudflare
curl -sk --resolve aureviagaming.com:443:<VPS-IP> https://aureviagaming.com/api/health  # connection closed
```

Refresh the ranges weekly, because Cloudflare occasionally adds new ones.
Cron's default `PATH` has no `/usr/sbin`, where `nginx` lives, so the cron file
sets its own; without it every weekly run fails `nginx -t` and keeps the old
ranges:

```bash
sudo install -o root -g root -m 0755 ops/update-cloudflare-ips.sh /usr/local/sbin/aurevia-update-cloudflare-ips
sudo tee /etc/cron.d/aurevia-cloudflare-ips >/dev/null <<'CRON'
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
17 4 * * 1 root /usr/local/sbin/aurevia-update-cloudflare-ips >>/var/log/aurevia-cloudflare-ips.log 2>&1
CRON
```

If `nginx -t` rejects a refreshed include, the script puts the previous one
back, leaves Nginx running unchanged and exits non-zero.

Optionally, also restrict TCP 80/443 to the same ranges in the firewall
(`ufw allow from <range> to any port 80,443 proto tcp` for each range, then
`ufw deny 80,443/tcp`). The Nginx check already refuses direct hits; the
firewall also stops them before TLS.

Done on 2026-10-16 (Nginx backup: `/root/nginx-backup-2026-10-16-0729`):
- The include, the snippet and the weekly refresh are installed as above.
- Production's server block has the three changes. Its Next.js location keeps
  `proxy_set_header X-Forwarded-Host $host` and its timeouts after the snippet.
  The backend snippet it includes (`nginx-aurevia-playngo.snippet`, from the
  backend release) is unchanged; its `X-Real-IP $remote_addr` is now the visitor.
- Staging runs `ops/nginx-staging.conf`, and play runs `ops/nginx-play-runtime.conf`.
- Direct requests to the VPS address get an empty reply on ports 80 and 443,
  for every host name and the bare IP. ACME challenges still reach port 80, and
  Certbot keeps renewing through `snap.certbot.renew.timer`.
- The optional firewall restriction is not applied.

## 2. Install the updated deploy helper

`ops/deploy-release.sh` now:
- reads the uploaded archive and checksum as `deploy`, never as root, so a
  swapped symlink can't expose root-only files;
- refuses archives with symlinks, hard links, device files, absolute paths or
  `..`, unpacks into a randomly named directory and writes `.revision` and
  `.environment` as the runtime account, so a planted link can't make root
  overwrite a system file;
- checks free disk space first, deletes a failed release after rolling back,
  and never prunes the live or previous release;
- keeps going if the SSH connection drops, and logs every run to
  `/var/log/aurevia-deploy/`; its lock lives in the root-only
  `/run/aurevia-deploy`;
- restarts the site as one PM2 fork-mode process, like the original helper,
  so each deploy makes it unavailable for a few seconds. PM2 7 has no
  `--exec-mode` option; an earlier version of this helper relied on it, and
  its restart and rollback failed on the VPS.

The sudo rule now pins each environment's archive name, so install both:

```bash
sudo install -o root -g root -m 0755 ops/deploy-release.sh /usr/local/sbin/aurevia-deploy
sudo visudo -cf ops/aurevia-deploy.sudoers
sudo install -o root -g root -m 0440 ops/aurevia-deploy.sudoers /etc/sudoers.d/aurevia-deploy
```

Re-run the latest staging deployment to test the helper before production
uses it. Afterwards, `pm2 ls` shows `aurevia-gaming-staging` online in `fork`
mode, and the new release directory ends in a random six-character suffix.

Done: the helper, gate and sudo rule on the VPS match this repository. Every
staging and production deployment on 2026-10-16 ran through them and reported
`Deployment healthy`, in fork mode, with random-suffix release directories.

## 3. Per-environment deploy keys

Done: each GitHub environment deploys with its own key, pinned to
`/usr/local/sbin/aurevia-ssh-gate`, and the shared key with a shell is gone.
`scripts/deploy-vps.sh` supports only this protocol; a key without the forced
command fails with exit 127 and changes nothing. To set up or replace a key,
follow *Per-environment deploy keys* or *Key rotation* in
[AUTO-DEPLOY.md](AUTO-DEPLOY.md).

## 4. Separate runtime and CI accounts per environment

Both sites still run as `deploy`, which also owns both release trees, the
inbox, `~/.ssh` and both sudo rules, so code running in staging can reach
production. Follow *Separate the environments on the VPS* in
[AUTO-DEPLOY.md](AUTO-DEPLOY.md): it adds `aurevia-staging` and
`aurevia-production` runtime accounts, then `aurevia-ci-staging` and
`aurevia-ci-production` CI accounts, each with a sudo rule pinned to its own
environment. The helper uses each account as soon as it exists.

Not done. On 2026-10-16 only the prerequisite was installed: Node.js 24.19.0
from the official nodejs.org tarball, checked against its `SHASUMS256.txt`, in
`/usr/local`, and `pm2@7.0.3`. No account, key or sudo rule has changed yet.
Until production moves, `deploy`'s login shell finds `/usr/local/bin/pm2` before
its nvm copy, so production deployments drive `deploy`'s PM2 daemon (7.0.3,
under nvm) with the system `pm2`. Keep the two at the same version until then.

## 5. Portal backend (playngo-sandbox, not in this repository)

The website proxy sends the visitor address as `X-Real-IP` and
`X-Forwarded-For` and, in production, no longer forwards the
`aurevia_admin_test` or `aurevia_demo_test` cookies.

Done on 2026-10-16 in the backend (commit `f3d1da3`, deployed as image
`png-portal:1.0.1`):
- The portal believes those headers only when its TCP peer is listed in
  `PNG_TRUSTED_PROXIES`. That peer is never `127.0.0.1`: requests reach the
  portal through the internal Caddy container `png-proxy` on the
  `docker_default` network, which other containers share. Production therefore
  sets `PNG_TRUSTED_PROXIES=png-proxy`, resolved by name every 30 seconds, rather
  than the whole subnet.
- Login (20 per 15 minutes), new demo visitors (10 per minute) and demo
  launches (30 per minute) are limited per visitor address before the shared
  limits.
- Production already ignored the test cookies (`PNG_ENVIRONMENT=sandbox`). The
  portal now refuses to start with `PNG_ENVIRONMENT=test` unless its public URL
  is plain-HTTP localhost or loopback.

## 6. Serve demo runtimes from their own origin

While Play'n GO runtime code runs on `aureviagaming.com`, its scripts can call
`/api/portal/admin/*` with a signed-in admin's cookies. The iframe now has a
`sandbox` attribute, but on the same origin that is not a security boundary.

Done on 2026-10-16. Afterwards the main site's server block also got

```nginx
location ^~ /playngo-sandbox/runtime/ {
    return 404;
}
```

so the runtime is served only from `play.aureviagaming.com`. Every other
`/playngo-sandbox/` route (API, docs, portal, lab) still works on
`aureviagaming.com`, because `PNG_PUBLIC_BASE_URL` stays
`https://aureviagaming.com/playngo-sandbox`.

1. Add a proxied (orange-cloud) DNS record for `play.aureviagaming.com`.
2. Issue its certificate and install `ops/nginx-play-runtime.conf`. It serves only
   `/playngo-sandbox/runtime/` from the backend at `127.0.0.1:18080`, returns 404
   for every other path (including `/api/portal/` and `/playngo-sandbox/portal/`),
   lets only the production and staging websites frame it and, like the other
   sites, accepts only Cloudflare traffic (step 1 must be installed first):

   ```bash
   # A temporary HTTP site lets Certbot complete its challenge, as for staging.
   sudo tee /etc/nginx/sites-available/aurevia-play >/dev/null <<'NGINX'
   server {
       listen 80;
       listen [::]:80;
       server_name play.aureviagaming.com;
       return 404;
   }
   NGINX
   sudo ln -sfn /etc/nginx/sites-available/aurevia-play /etc/nginx/sites-enabled/aurevia-play
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d play.aureviagaming.com --non-interactive --redirect --cert-name play.aureviagaming.com
   sudo install -o root -g root -m 0644 ops/nginx-play-runtime.conf /etc/nginx/sites-available/aurevia-play
   sudo nginx -t && sudo systemctl reload nginx
   ```

   Check that `https://play.aureviagaming.com/api/portal/admin/me` returns 404.
3. Have the backend issue `launch_url` values on that origin. The live backend
   runs from `runtime-compose.json` in its current release under
   `/opt/PlaynGo_Integration/releases/`; `PNG_RUNTIME_BASE_URL` and every
   `<GAME>_APP_BASE_URL` start with `https://aureviagaming.com/playngo-sandbox/runtime`.
   Back up that file, change the prefix to
   `https://play.aureviagaming.com/playngo-sandbox/runtime`, and recreate the
   containers with `docker compose -f runtime-compose.json up -d` from the release
   folder. The runtime accepts calls from its own origin, so nothing else changes.
   Do this right after step 4 reaches production: the website accepts launch URLs
   from one origin only, so demos fail between the two deploys.
4. Set `NEXT_PUBLIC_DEMO_RUNTIME_ORIGIN: https://play.aureviagaming.com` in
   the build settings at the top of `.github/workflows/deploy-staging.yml` and
   `deploy-production.yml`. Staging builds with it once the change reaches
   `dev`, production after the promotion. The player accepts launches only from
   that origin, and the CSP allows framing it.

The admin cookies use the `__Host-` prefix, so the browser never sends them to
`play.aureviagaming.com`.
