import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderProduct {
  productId: string;
  name: string;
  category: "tshirt" | "shoes" | "hoodie";
  size: string;
  color: string;
  price: number;
  imageUrl: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  orderDate: Date;
  status: "delivered" | "shipped" | "processing" | "cancelled";
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ["tshirt", "shoes", "hoodie"], required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [OrderProductSchema],
    orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["delivered", "shipped", "processing", "cancelled"],
      default: "delivered",
    },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
