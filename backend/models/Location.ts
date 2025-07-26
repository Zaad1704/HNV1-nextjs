import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  type: 'country' | 'state' | 'city' | 'area';
  code?: string;
  parentId?: mongoose.Types.ObjectId;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema: Schema<ILocation> = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['country', 'state', 'city', 'area'], required: true },
  code: String,
  parentId: { type: Schema.Types.ObjectId, ref: 'Location' },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ILocation>('Location', LocationSchema);