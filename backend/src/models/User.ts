import mongoose, { Schema } from 'mongoose';

export interface IUser {
  firebaseUid: string;
  email: string;
  householdId: mongoose.Types.ObjectId | null;
  expoPushToken: string | null;
  savedCategoryId: string | null;
  savedCategoryName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    householdId: { type: Schema.Types.ObjectId, ref: 'Household', default: null },
    expoPushToken: { type: String, default: null },
    savedCategoryId: { type: String, default: null },
    savedCategoryName: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
