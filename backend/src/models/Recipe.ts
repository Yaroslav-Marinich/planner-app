import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipeIngredient {
  productId: mongoose.Types.ObjectId;
  amount: number;
}

export interface IRecipe {
  householdId: mongoose.Types.ObjectId;
  authorId: string;
  name: string;
  instructions?: string;
  prepTime?: number;
  basePortions: number;
  ingredients: IRecipeIngredient[];
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema: Schema = new Schema(
  {
    householdId: { type: Schema.Types.ObjectId, ref: 'Household', required: true },
    authorId: { type: String, required: true },
    name: { type: String, required: true },
    instructions: { type: String },
    prepTime: { type: Number },
    basePortions: { type: Number, required: true, min: 1 },
    ingredients: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        amount: { type: Number, required: true, min: 0 }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);
