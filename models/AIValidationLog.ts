import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIValidationLog extends Document {
  returnId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  description: string;
  validationResult: {
    match: boolean;
    confidence: number;
    reason: string;
  };
  processingTime: number; // in milliseconds
  apiResponse: string; // raw response from Gemini
  errorMessage?: string;
  createdAt: Date;
}

const AIValidationLogSchema = new Schema<IAIValidationLog>(
  {
    returnId: { type: Schema.Types.ObjectId, ref: "Return", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    validationResult: {
      match: { type: Boolean, required: true },
      confidence: { type: Number, required: true },
      reason: { type: String, required: true }
    },
    processingTime: { type: Number, required: true },
    apiResponse: { type: String, required: true },
    errorMessage: { type: String }
  },
  { timestamps: true }
);

const AIValidationLog: Model<IAIValidationLog> =
  mongoose.models.AIValidationLog || mongoose.model<IAIValidationLog>("AIValidationLog", AIValidationLogSchema);

export default AIValidationLog;
