// express-backend/src/models/Comment.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  text: string;
  createdAt: Date;
  userId: mongoose.Types.ObjectId;
  wasteListingId: mongoose.Types.ObjectId;
}

const CommentSchema: Schema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wasteListingId: { type: Schema.Types.ObjectId, ref: 'WasteListing', required: true },
});

export default mongoose.model<IComment>('Comment', CommentSchema);