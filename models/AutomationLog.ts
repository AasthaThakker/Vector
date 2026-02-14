import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAutomationLog extends Document {
  workflowId: string;
  returnId: mongoose.Types.ObjectId;
  action: string;
  status: "success" | "failed" | "pending";
  details: string;
  timestamp: Date;
}

const AutomationLogSchema = new Schema<IAutomationLog>({
  workflowId: { type: String, required: true },
  returnId: { type: Schema.Types.ObjectId, ref: "Return" },
  action: { type: String, required: true },
  status: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
  details: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const AutomationLog: Model<IAutomationLog> =
  mongoose.models.AutomationLog ||
  mongoose.model<IAutomationLog>("AutomationLog", AutomationLogSchema);

export default AutomationLog;
