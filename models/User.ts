import mongoose, { Schema, Document, Model } from "mongoose";

export interface TrustFactors {
  averageReturnPrice: number;
  returnFrequency: number;
  returnRate: number;
  accountAge: number;
  successRate: number;
  timePatternScore: number;
  fraudFlagCount: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin" | "warehouse" | "logistics";
  trustScore: number;
  trustScoreUpdatedAt?: Date;
  trustFactors?: TrustFactors;
  riskLevel?: "low" | "medium" | "high";
  lastMLRiskScore?: number;
  lastMLPrediction?: "LEGITIMATE" | "SUSPICIOUS" | "FRAUD";
  lastMLRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Date;
}

const TrustFactorsSchema = new Schema<TrustFactors>(
  {
    averageReturnPrice: { type: Number, default: 0 },
    returnFrequency: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
    accountAge: { type: Number, default: 0 },
    successRate: { type: Number, default: 1 },
    timePatternScore: { type: Number, default: 1 },
    fraudFlagCount: { type: Number, default: 0 }
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "admin", "warehouse", "logistics"],
      default: "customer",
    },
    trustScore: { type: Number, default: 100, min: 0, max: 100 },
    trustScoreUpdatedAt: { type: Date },
    trustFactors: { type: TrustFactorsSchema, default: {} },
    riskLevel: { type: String, enum: ["low", "medium", "high"], default: "low" },
    lastMLRiskScore: { type: Number },
    lastMLPrediction: { type: String, enum: ["LEGITIMATE", "SUSPICIOUS", "FRAUD"] },
    lastMLRiskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
