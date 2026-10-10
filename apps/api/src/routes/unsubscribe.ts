import { Hono } from 'hono'
import { adminConfig } from '../config/env.js'
import { rateLimit } from '../middleware/rateLimit.js'
import { WaitlistEntry } from '../models/waitlistEntry.js'
import { verifyUnsubscribeToken } from '../lib/unsubscribe.js'

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

const page = (body: string) =>
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Unsubscribe</title><body style="font-family:sans-serif;max-width:420px;margin:15vh auto;padding:0 16px;text-align:center">${body}</body>`

export const unsubscribe = new Hono()

unsubscribe.use('*', async (c, next) => {
  if (!adminConfig) return c.json({ ok: false, error: 'Not found' }, 404)
  await next()
})
unsubscribe.use('*', rateLimit({ windowMs: 10 * 60_000, max: 30 }))

// GET only shows a confirm button, so link scanners/prefetchers can't unsubscribe anyone.
unsubscribe.get('/', (c) => {
  const e = c.req.query('e') ?? ''
  const t = c.req.query('t') ?? ''
  if (!verifyUnsubscribeToken(e, t)) return c.html(page('<p>This link is invalid.</p>'), 400)
  return c.html(
    page(`<h2>Unsubscribe</h2><p>Stop emails to <b>${esc(e)}</b>?</p>
<form method="post" action="?e=${encodeURIComponent(e)}&amp;t=${encodeURIComponent(t)}"><button style="padding:10px 20px">Unsubscribe</button></form>`),
  )
})

// Also the target of the List-Unsubscribe one-click POST.
unsubscribe.post('/', async (c) => {
  const e = (c.req.query('e') ?? '').toLowerCase()
  const t = c.req.query('t') ?? ''
  if (!verifyUnsubscribeToken(e, t)) return c.html(page('<p>This link is invalid.</p>'), 400)
  await WaitlistEntry.updateOne({ email: e, unsubscribedAt: { $exists: false } }, { unsubscribedAt: new Date() })
  return c.html(page("<h2>You're unsubscribed</h2><p>You won't receive more emails from Biizcon.</p>"))
})
