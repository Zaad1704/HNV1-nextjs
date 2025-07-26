import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhook extends Document {
  organizationId: mongoose.Types.ObjectId;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered?: Date;
  failureCount: number;
  createdAt: Date;
}

const WebhookSchema = new Schema<IWebhook>({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  url: { type: String, required: true },
  events: [{ type: String, required: true }],
  secret: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastTriggered: { type: Date },
  failureCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IWebhook>('Webhook', WebhookSchema);