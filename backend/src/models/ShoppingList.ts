import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  boughtAmount: number;
  price: number;
  transactionSent: boolean;
}

export interface IShoppingListItem {
  _id?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  plannedAmount: number;
  status: 'pending' | 'in_cart' | 'partially_bought' | 'fulfilled';
  lockedBy: string | null;
  purchases: IPurchase[];
}

export interface IShoppingList {
  householdId: mongoose.Types.ObjectId;
  status: 'active' | 'completed';
  items: IShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingListSchema: Schema = new Schema(
  {
    householdId: { type: Schema.Types.ObjectId, ref: 'Household', required: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        plannedAmount: { type: Number, required: true },
        status: {
          type: String,
          enum: ['pending', 'in_cart', 'partially_bought', 'fulfilled'],
          default: 'pending'
        },
        lockedBy: { type: String, default: null },
        purchases: [
          {
            userId: { type: String, required: true },
            boughtAmount: { type: Number, required: true },
            price: { type: Number, required: true },
            transactionSent: { type: Boolean, default: false }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IShoppingList>('ShoppingList', ShoppingListSchema);
