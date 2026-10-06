import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './config/env.js'
import { waitlist } from './routes/waitlist.js'

export const app = new Hono()

app.use(secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: (origin) => (env.CORS_ORIGINS.includes(origin) ? origin : null),
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 600,
  }),
)

app.get('/health', (c) => c.json({ ok: true }))
app.route('/api/waitlist', waitlist)

app.notFound((c) => c.json({ ok: false, error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error(err) // full detail stays in server logs only
  return c.json({ ok: false, error: 'Internal server error' }, 500)
})
