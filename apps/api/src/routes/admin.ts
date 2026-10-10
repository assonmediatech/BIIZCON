import { Hono, type Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { zValidator } from '@hono/zod-validator'
import { createHash, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { adminConfig } from '../config/env.js'
import { rateLimit } from '../middleware/rateLimit.js'
import { Campaign } from '../models/campaign.js'
import { WaitlistEntry } from '../models/waitlistEntry.js'
import { sendEmail } from '../lib/mailer.js'
import { runCampaign } from '../lib/runCampaign.js'

const invalid = (result: { success: boolean }, c: Context) =>
  result.success ? undefined : c.json({ ok: false, error: 'Invalid input' }, 400)

const sha = (s: string) => createHash('sha256').update(s).digest()

const message = z
  .object({
    subject: z.string().trim().min(1).max(200),
    html: z.string().min(1).max(200_000),
  })
  .strict()


export const admin = new Hono()

// Disabled entirely unless fully configured.
admin.use('*', async (c, next) => {
  if (!adminConfig) return c.json({ ok: false, error: 'Not found' }, 404)
  await next()
})
admin.use('*', rateLimit({ windowMs: 10 * 60_000, max: 100 }))
admin.use('*', bodyLimit({ maxSize: 300 * 1024, onError: (c) => c.json({ ok: false, error: 'Payload too large' }, 413) }))
admin.use('*', async (c, next) => {
  const header = c.req.header('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token || !timingSafeEqual(sha(token), sha(adminConfig!.adminToken))) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401)
  }
  await next()
})

admin.get('/stats', async (c) => {
  const [subscribed, unsubscribed] = await Promise.all([
    WaitlistEntry.countDocuments({ unsubscribedAt: { $exists: false } }),
    WaitlistEntry.countDocuments({ unsubscribedAt: { $exists: true } }),
  ])
  return c.json({ ok: true, subscribed, unsubscribed })
})

admin.get('/campaigns', async (c) => {
  const campaigns = await Campaign.find().select('-html').sort({ createdAt: -1 }).limit(20).lean()
  return c.json({ ok: true, campaigns })
})

admin.post('/test', zValidator('json', message.extend({ to: z.string().email().max(254) }), invalid), async (c) => {
  const { to, subject, html } = c.req.valid('json')
  try {
    await sendEmail(to, `[TEST] ${subject}`, html)
  } catch (err) {
    console.error('test send failed', (err as Error).message)
    return c.json({ ok: false, error: 'Could not send. Check SMTP settings and server logs.' }, 502)
  }
  return c.json({ ok: true })
})

admin.post('/campaigns', zValidator('json', message, invalid), async (c) => {
  if (await Campaign.exists({ status: 'sending' })) {
    return c.json({ ok: false, error: 'A campaign is already sending.' }, 409)
  }
  const campaign = await Campaign.create(c.req.valid('json'))
  void runCampaign(String(campaign._id))
  return c.json({ ok: true, id: String(campaign._id) }, 202)
})
