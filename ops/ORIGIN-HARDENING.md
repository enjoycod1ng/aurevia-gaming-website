# Origin hardening runbook (October 2026)

These are the VPS and backend steps for the fixes in this repository. Each step
can be done separately. Do them in this order, and staging before production
where a step applies to both.

Keep a second SSH session open while changing Nginx or the firewall.

`scripts/deploy-vps.sh` uses the gated protocol unless a GitHub environment
sets `VPS_DEPLOY_PROTOCOL=legacy`. Until an environment's key is pinned to the
gate (step 3), set that variable on it, or its deployments fail with exit 127
and change nothing.

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

Refresh the ranges weekly, because Cloudflare occasionally adds new ones:

```bash
sudo install -o root -g root -m 0755 ops/update-cloudflare-ips.sh /usr/local/sbin/aurevia-update-cloudflare-ips
echo '17 4 * * 1 root /usr/local/sbin/aurevia-update-cloudflare-ips' | sudo tee /etc/cron.d/aurevia-cloudflare-ips
```

If `nginx -t` rejects a refreshed include, the script puts the previous one
back, leaves Nginx running unchanged and exits non-zero.

Optionally, also restrict TCP 80/443 to the same ranges in the firewall
(`ufw allow from <range> to any port 80,443 proto tcp` for each range, then
`ufw deny 80,443/tcp`). The Nginx check already refuses direct hits; the
firewall also stops them before TLS.

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
- runs the site as one PM2 cluster worker and uses `pm2 reload`, so deploys
  don't drop requests.

The sudo rule now pins each environment's archive name, so install both:

```bash
sudo install -o root -g root -m 0755 ops/deploy-release.sh /usr/local/sbin/aurevia-deploy
sudo visudo -cf ops/aurevia-deploy.sudoers
sudo install -o root -g root -m 0440 ops/aurevia-deploy.sudoers /etc/sudoers.d/aurevia-deploy
```

The first deploy after this restarts each site once to move it from fork mode
to cluster mode. Later deploys reload without downtime. Afterwards, `pm2 ls`
shows `cluster` mode for `aurevia-gaming` and `aurevia-gaming-staging`.

## 3. Per-environment deploy keys

Follow *Per-environment deploy keys* in [AUTO-DEPLOY.md](AUTO-DEPLOY.md), then
delete `VPS_DEPLOY_PROTOCOL` from both GitHub environments (or set it to
`gated`). Until then, the staging key can still deploy production on the VPS.

## 4. Separate runtime and CI accounts per environment

Both sites still run as `deploy`, which also owns both release trees, the
inbox, `~/.ssh` and both sudo rules, so code running in staging can reach
production. Follow *Separate the environments on the VPS* in
[AUTO-DEPLOY.md](AUTO-DEPLOY.md): it adds `aurevia-staging` and
`aurevia-production` runtime accounts, then `aurevia-ci-staging` and
`aurevia-ci-production` CI accounts, each with a sudo rule pinned to its own
environment. The helper uses each account as soon as it exists.

## 5. Portal backend (playngo-sandbox, not in this repository)

- The website proxy now sends the visitor address as `X-Real-IP` and
  `X-Forwarded-For`. Configure the backend to trust those headers only from
  `127.0.0.1`, and to key its login and demo limits on them.
- In production the proxy no longer forwards the `aurevia_admin_test` or
  `aurevia_demo_test` cookies. The backend should also stop accepting them
  outside local development.

## 6. Serve demo runtimes from their own origin

While Play'n GO runtime code runs on `aureviagaming.com`, its scripts can call
`/api/portal/admin/*` with a signed-in admin's cookies. The iframe now has a
`sandbox` attribute, but on the same origin that is not a security boundary.

1. Add a proxied DNS record, for example `play.aureviagaming.com`.
2. Add an Nginx server block for it that serves only
   `/playngo-sandbox/runtime/` from the backend at `127.0.0.1:18080`, with the
   same Cloudflare-only rule. Return 404 for every other path, especially
   `/api/portal/` and `/playngo-sandbox/portal/`.
3. Have the backend issue `launch_url` values on that origin, and allow its
   runtime API calls from it.
4. Set the GitHub environment variable
   `NEXT_PUBLIC_DEMO_RUNTIME_ORIGIN=https://play.aureviagaming.com` (staging
   first). Then redeploy. The player accepts launches only from that origin,
   and the CSP allows framing it.

The admin cookies use the `__Host-` prefix, so the browser never sends them to
`play.aureviagaming.com`.
