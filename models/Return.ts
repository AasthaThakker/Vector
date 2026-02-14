import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIAnalysis {
  match: boolean;
  confidence: number;
  reason: string;
  analyzedAt: Date;
}

export interface IReturn extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productId: string;
  reason: string;
  description: string;
  imageUrl: string;
  aiAnalysisResult: IAIAnalysis | null;
  fraudFlag: boolean;
  validationStatus: "pending" | "approved" | "rejected_ai" | "manual_review";
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "pickup_scheduled"
    | "pickup_completed"
    | "dropbox_received"
    | "warehouse_received"
    | "refund_initiated"
    | "completed";
  returnMethod: "pickup" | "dropbox";
  qrCodeData: string;
  dropboxLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    match: Boolean,
    confidence: Number,
    reason: String,
    analyzedAt: Date,
  },
  { _id: false }
);

const ReturnSchema = new Schema<IReturn>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    aiAnalysisResult: { type: AIAnalysisSchema, default: null },
    fraudFlag: { type: Boolean, default: false },
    validationStatus: { 
      type: String, 
      enum: ["pending", "approved", "rejected_ai", "manual_review"],
      default: "pending"
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "pickup_scheduled",
        "pickup_completed",
        "dropbox_received",
        "warehouse_received",
        "refund_initiated",
        "completed",
      ],
      default: "pending",
    },
    returnMethod: { type: String, enum: ["pickup", "dropbox"], required: true },
    qrCodeData: { type: String, default: "" },
    dropboxLocation: { type: String, default: "" },
  },
  { timestamps: true }
);

const Return: Model<IReturn> =
  mongoose.models.Return || mongoose.model<IReturn>("Return", ReturnSchema);

export default Return;
