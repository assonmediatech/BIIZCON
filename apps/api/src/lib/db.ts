import mongoose from 'mongoose'
import { env } from '../config/env.js'

export async function connectDb() {
  mongoose.set('strictQuery', true)
  // Reject operator objects in filters ({ email: { $ne: null } }) as an extra NoSQL-injection guard.
  mongoose.set('sanitizeFilter', true)
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 })
}

export const disconnectDb = () => mongoose.disconnect()
