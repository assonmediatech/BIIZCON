import { Schema, model } from 'mongoose'

const waitlistEntrySchema = new Schema(
  {
    // Stored lowercased + trimmed; the unique index makes signups idempotent and race-safe.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    source: { type: String, trim: true, maxlength: 64, default: 'unknown' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
)

export const WaitlistEntry = model('WaitlistEntry', waitlistEntrySchema)
