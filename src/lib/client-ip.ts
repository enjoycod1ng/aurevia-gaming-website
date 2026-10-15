import { isIP } from "node:net";

// Nginx overwrites X-Real-IP with $remote_addr, which its realip module only
// replaces with CF-Connecting-IP when the connection came from a Cloudflare
// range (ops/nginx-cloudflare.conf). Next.js listens on 127.0.0.1, so nothing
// else can reach it. CF-Connecting-IP and X-Forwarded-For are ignored: any
// client that reaches the origin directly can set them.
export function getClientIp(headers: Headers): string | null {
  const value = headers.get("x-real-ip")?.trim();
  return value && isIP(value) ? value : null;
}
