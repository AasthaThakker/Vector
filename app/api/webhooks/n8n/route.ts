import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import AutomationLog from "@/models/AutomationLog";

/**
 * n8n Webhook Endpoint
 * Receives callbacks from n8n workflows.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { returnId, action, data } = body;

    if (!returnId || !action) {
      return NextResponse.json({ error: "returnId and action required" }, { status: 400 });
    }

    await connectDB();

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    let logStatus: "success" | "failed" = "success";
    let newStatus = returnRequest.status;

    switch (action) {
      case "approve":
        newStatus = "approved";
        await Return.findByIdAndUpdate(returnId, { status: "approved" });
        break;
      case "reject":
        newStatus = "rejected";
        await Return.findByIdAndUpdate(returnId, { status: "rejected" });
        break;
      case "manual_review":
        break;
      case "update_trust":
        break;
      default:
        logStatus = "failed";
    }

    await AutomationLog.create({
      workflowId: `n8n_${action}`,
      returnId: returnRequest._id,
      action: `n8n webhook: ${action}`,
      status: logStatus,
      details: JSON.stringify(data || {}),
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("n8n webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
