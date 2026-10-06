import type { MiddlewareHandler } from 'hono'
import { clientIp } from '../lib/clientIp.js'

interface Options {
  windowMs: number
  max: number
}

/** Fixed-window, per-IP, in-memory limiter. Per-instance: swap for a shared store if you scale out. */
export function rateLimit({ windowMs, max }: Options): MiddlewareHandler {
  const hits = new Map<string, { count: number; resetAt: number }>()

  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
  }, windowMs).unref()

  return async (c, next) => {
    const key = clientIp(c)
    const now = Date.now()
    let entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs }
      hits.set(key, entry)
    }
    entry.count++

    if (entry.count > max) {
      c.header('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      return c.json({ ok: false, error: 'Too many requests. Please try again later.' }, 429)
    }
    await next()
  }
}
