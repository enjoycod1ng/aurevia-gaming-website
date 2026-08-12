# VPS operations files

Production currently runs Nginx -> Next.js on `127.0.0.1:3000`, supervised by
the enabled `pm2-deploy` systemd service. The files below describe the optional
future migration to Caddy and the standalone Next.js server; they are not the
active production proxy or supervisor.

- `aurevia-gaming.service`: systemd unit for the standalone Next.js server.
- `Caddyfile`: domain redirect, TLS reverse proxy, compression and cache headers.
- `deploy-release.sh`: timestamped release deployment, health check and retention.
- `CLOUDFLARE-PRODUCTION.md`: exact Cloudflare Free, Turnstile, GA4 and verification checklist.

The service expects:

- application symlink: `/var/www/aurevia-gaming/current`
- runtime user/group: `aurevia:aurevia`
- Node executable: `/usr/bin/node`
- server binding: `127.0.0.1:3000`
- environment file: `/etc/aurevia-gaming.env`

If Node is installed elsewhere, change `ExecStart` in the unit before installing it. Keep port 3000 private; Caddy is the only public entry point.

The Caddyfile trusts only Cloudflare's published proxy ranges when restoring the
visitor IP. Re-check those ranges before each infrastructure change and restrict
public ports 80/443 to Cloudflare at the VPS firewall after validating SSH access.
