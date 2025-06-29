// express-backend/src/models/WasteListing.ts
import mongoose, { Document, Schema } from 'mongoose';

export enum WasteStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ItemTypeEnum {
  WASTE = 'WASTE',
  OLD_ITEM = 'OLD_ITEM',
}

export enum WasteCategoryEnum {
  BIODEGRADABLE = 'BIODEGRADABLE',
  NON_BIODEGRADABLE = 'NON_BIODEGRADABLE',
  RECYCLABLE_PLASTIC = 'RECYCLABLE_PLASTIC',
  RECYCLABLE_PAPER = 'RECYCLABLE_PAPER',
  RECYCLABLE_METAL = 'RECYCLABLE_METAL',
  E_WASTE = 'E_WASTE',
  HAZARDOUS = 'HAZARDOUS',
  OTHER = 'OTHER',
}

export interface IWasteListing extends Document {
  userId: mongoose.Types.ObjectId;
  wasteType: string;
  quantity: string;
  unit?: string;
  description?: string;
  status: WasteStatus;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  assignedCollectorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  itemType: ItemTypeEnum;
  wasteCategory?: WasteCategoryEnum;
  imageUrl?: string;
  price?: number;
}

const WasteListingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wasteType: { type: String, required: true },
  quantity: { type: String, required: true },
  unit: { type: String },
  description: { type: String },
  status: { type: String, enum: Object.values(WasteStatus), default: WasteStatus.PENDING },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  assignedCollectorId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  itemType: { type: String, enum: Object.values(ItemTypeEnum), required: true },
  wasteCategory: { type: String, enum: Object.values(WasteCategoryEnum) },
  imageUrl: { type: String },
  price: { type: Number },
}, { timestamps: true });

export default mongoose.model<IWasteListing>('WasteListing', WasteListingSchema);