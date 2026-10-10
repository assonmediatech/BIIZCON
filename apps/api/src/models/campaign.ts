import { Schema, model } from 'mongoose'

const campaignSchema = new Schema(
  {
    subject: { type: String, required: true, maxlength: 200 },
    html: { type: String, required: true, maxlength: 200_000 },
    status: { type: String, enum: ['sending', 'done', 'failed'], default: 'sending' },
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    finishedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
)

export const Campaign = model('Campaign', campaignSchema)
