// express-backend/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export enum UserType {
  GENERATOR = 'GENERATOR',
  COLLECTOR = 'COLLECTOR',
  ADMIN = 'ADMIN',
}

export enum UserRole {
  LISTER = 'LISTER',
  COLLECTOR = 'COLLECTOR',
  ADMIN = 'ADMIN',
}

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name?: string;
  displayName?: string;
  userType: UserType;
  role: UserRole;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  name: { type: String },
  displayName: { type: String },
  userType: { type: String, enum: Object.values(UserType), required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.LISTER },
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);