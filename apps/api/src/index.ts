import { serve } from '@hono/node-server'
import { app } from './app.js'
import { env } from './config/env.js'
import { connectDb, disconnectDb } from './lib/db.js'

await connectDb()
console.log('MongoDB connected')

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API listening on :${info.port}`)
})

function shutdown() {
  server.close(async () => {
    await disconnectDb()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
