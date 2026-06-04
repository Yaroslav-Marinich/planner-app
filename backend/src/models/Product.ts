import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct {
  householdId: mongoose.Types.ObjectId;
  name: string;
  defaultUnit: 'g' | 'ml' | 'pcs';
  isDivisible: boolean;
  inStockAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    householdId: { type: Schema.Types.ObjectId, ref: 'Household', required: true },
    name: { type: String, required: true },
    defaultUnit: { type: String, enum: ['g', 'ml', 'pcs'], required: true },
    isDivisible: { type: Boolean, required: true },
    inStockAmount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
