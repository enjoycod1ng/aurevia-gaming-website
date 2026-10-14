# VPS operations files

The GitHub Actions staging/production release flow is documented in
[`AUTO-DEPLOY.md`](AUTO-DEPLOY.md).

Production currently runs Nginx -> Next.js on `127.0.0.1:3000`, supervised by
the enabled `pm2-deploy` systemd service. Staging uses port 3001. Both run the packaged Next.js standalone server. `Caddyfile` and `aurevia-gaming.service` are optional proxy/supervisor migration examples; the other deployment files support the active PM2 flow.

- `aurevia-gaming.service`: systemd unit for the standalone Next.js server.
- `Caddyfile`: domain redirect, TLS reverse proxy, compression and cache headers.
- `deploy-release.sh`: hardened PM2 release deployment, exact-revision health
  check, automatic rollback and retention. Install it root-owned as
  `/usr/local/sbin/aurevia-deploy`; workflows must never overwrite it.
- `nginx-staging.conf`: isolated staging reverse proxy on port 3001.
- `aurevia-deploy.sudoers`: restricted sudo entry for the `deploy` account.
- `CLOUDFLARE-PRODUCTION.md`: exact Cloudflare Free, Turnstile, GA4 and verification checklist.

The optional standalone systemd example expects:

- application symlink: `/var/www/aurevia-gaming/current`
- runtime user/group: `aurevia:aurevia`
- Node executable: `/usr/bin/node`
- server binding: `127.0.0.1:3000`
- environment file: `/etc/aurevia-gaming.env`

If Node is installed elsewhere, change `ExecStart` in the unit before installing it. Keep port 3000 private; only the selected reverse proxy should be public.

The Caddyfile trusts only Cloudflare's published proxy ranges when restoring the
visitor IP. Re-check those ranges before each infrastructure change and restrict
public ports 80/443 to Cloudflare at the VPS firewall after validating SSH access.
