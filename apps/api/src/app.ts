import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './config/env.js'
import { waitlist } from './routes/waitlist.js'
import { admin } from './routes/admin.js'
import { unsubscribe } from './routes/unsubscribe.js'

export const app = new Hono()

app.use(secureHeaders())
const corsOptions = {
  origin: (origin: string) => (env.CORS_ORIGINS.includes(origin) ? origin : null),
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}
app.use('/api/waitlist/*', cors(corsOptions))
app.use('/api/admin/*', cors(corsOptions))

app.get('/health', (c) => c.json({ ok: true }))
app.route('/api/waitlist', waitlist)
app.route('/api/admin', admin)
app.route('/api/unsubscribe', unsubscribe)

app.notFound((c) => c.json({ ok: false, error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error(err) // full detail stays in server logs only
  return c.json({ ok: false, error: 'Internal server error' }, 500)
})
