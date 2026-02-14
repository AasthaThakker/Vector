import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventory extends Document {
  productName: string;
  category: "tshirt" | "shirt" | "pants" | "jeans" | "dress" | "jacket" | "hoodie" | "sweater" | "shorts" | "skirt" | "blazer" | "coat" | "polo" | "tanktop" | "cardigan";
  subcategory?: string;
  brand: string;
  size: string;
  color: string;
  material: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  minStock: number;
  season: "spring" | "summer" | "fall" | "winter" | "all";
  gender: "men" | "women" | "unisex";
  style?: string;
  imageUrl?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productName: { type: String, required: true },
    category: { type: String, enum: ["tshirt", "shirt", "pants", "jeans", "dress", "jacket", "hoodie", "sweater", "shorts", "skirt", "blazer", "coat", "polo", "tanktop", "cardigan"], required: true },
    subcategory: { type: String },
    brand: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    material: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 5, min: 0 },
    season: { type: String, enum: ["spring", "summer", "fall", "winter", "all"], default: "all" },
    gender: { type: String, enum: ["men", "women", "unisex"], required: true },
    style: { type: String },
    imageUrl: { type: String },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", InventorySchema);

export default Inventory;
