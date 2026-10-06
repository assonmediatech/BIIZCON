import type { Context } from 'hono'
import { getConnInfo } from '@hono/node-server/conninfo'
import { env } from '../config/env.js'

/**
 * X-Forwarded-For is client-controlled, so only trust the entries appended by OUR proxies:
 * with N trusted hops, the real client is the Nth entry from the right.
 */
export function clientIp(c: Context): string {
  if (env.TRUST_PROXY_HOPS > 0) {
    const parts = (c.req.header('x-forwarded-for') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    const ip = parts[parts.length - env.TRUST_PROXY_HOPS]
    if (ip) return ip
  }
  return getConnInfo(c).remote.address ?? 'unknown'
}
