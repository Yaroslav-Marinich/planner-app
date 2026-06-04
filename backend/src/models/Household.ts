import mongoose, { Schema, Document } from 'mongoose';

export interface IHousehold extends Document {
  name: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

const HouseholdSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: true },
    members: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IHousehold>('Household', HouseholdSchema);
