import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventory extends Document {
  productName: string;
  category: "tshirt" | "shoes" | "hoodie";
  size: string;
  color: string;
  stock: number;
}

const InventorySchema = new Schema<IInventory>(
  {
    productName: { type: String, required: true },
    category: { type: String, enum: ["tshirt", "shoes", "hoodie"], required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", InventorySchema);

export default Inventory;
