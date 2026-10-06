import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { WaitlistEntry } from '../models/waitlistEntry.js'
import { rateLimit } from '../middleware/rateLimit.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const bodySchema = z
  .object({
    email: z.string().trim().toLowerCase().max(254).regex(EMAIL_RE, 'Invalid email address'),
    source: z.string().trim().max(64).optional(),
    // Honeypot: hidden from humans in the UI; bots fill it in.
    website: z.string().optional(),
  })
  .strict()

export const waitlist = new Hono()

waitlist.post(
  '/',
  rateLimit({ windowMs: 10 * 60_000, max: 10 }),
  bodyLimit({
    maxSize: 2 * 1024,
    onError: (c) => c.json({ ok: false, error: 'Payload too large' }, 413),
  }),
  async (c, next) => {
    if (!c.req.header('content-type')?.toLowerCase().startsWith('application/json')) {
      return c.json({ ok: false, error: 'Content-Type must be application/json' }, 415)
    }
    await next()
  },
  zValidator('json', bodySchema, (result, c) => {
    if (!result.success) return c.json({ ok: false, error: 'Please provide a valid email address.' }, 400)
  }),
  async (c) => {
    const { email, source, website } = c.req.valid('json')

    // Pretend success to bots without touching the DB.
    if (website) return c.json({ ok: true }, 201)

    try {
      await WaitlistEntry.create({ email, source })
    } catch (err) {
      // Duplicate key: respond identically to a new signup so emails can't be enumerated.
      if ((err as { code?: number }).code !== 11000) throw err
    }
    return c.json({ ok: true }, 201)
  },
)
