import mongoose, { Schema, Document } from 'mongoose';

export interface IPlannedMeal {
  _id?: mongoose.Types.ObjectId;
  recipeId: mongoose.Types.ObjectId;
  portions: number;
  isCooked: boolean;
}

export interface IMenuDay {
  _id?: mongoose.Types.ObjectId;
  date: Date;
  plannedMeals: IPlannedMeal[];
}

export interface IMenu {
  householdId: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  days: IMenuDay[];
  createdAt: Date;
  updatedAt: Date;
}

const MenuSchema: Schema = new Schema(
  {
    householdId: { type: Schema.Types.ObjectId, ref: 'Household', required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: [
      {
        date: { type: Date, required: true },
        plannedMeals: [
          {
            recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
            portions: { type: Number, required: true },
            isCooked: { type: Boolean, default: false }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IMenu>('Menu', MenuSchema);
