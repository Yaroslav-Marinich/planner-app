import mongoose, { Schema, Document } from 'mongoose';

export interface IJoinRequest extends Document {
  fromUserId: string;
  fromUserEmail: string;
  toOwnerId: string;
  householdId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const JoinRequestSchema: Schema = new Schema(
  {
    fromUserId: { type: String, required: true },
    fromUserEmail: { type: String, required: true },
    toOwnerId: { type: String, required: true },
    householdId: { type: Schema.Types.ObjectId, ref: 'Household', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);
