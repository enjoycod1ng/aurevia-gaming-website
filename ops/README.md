# VPS operations files

- `aurevia-gaming.service`: systemd unit for the standalone Next.js server.
- `Caddyfile`: domain redirect, TLS reverse proxy, compression and cache headers.
- `deploy-release.sh`: timestamped release deployment, health check and retention.

The service expects:

- application symlink: `/var/www/aurevia-gaming/current`
- runtime user/group: `aurevia:aurevia`
- Node executable: `/usr/bin/node`
- server binding: `127.0.0.1:3000`
- environment file: `/etc/aurevia-gaming.env`

If Node is installed elsewhere, change `ExecStart` in the unit before installing it. Keep port 3000 private; Caddy is the only public entry point.
