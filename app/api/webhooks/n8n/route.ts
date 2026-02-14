import { NextRequest, NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";

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

    const returnRequest = demoStore.findReturnById(returnId);
    if (!returnRequest) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    let logStatus: "success" | "failed" = "success";

    switch (action) {
      case "approve":
        demoStore.updateReturnStatus(returnId, "approved");
        break;
      case "reject":
        demoStore.updateReturnStatus(returnId, "rejected");
        break;
      case "manual_review":
        break;
      case "update_trust":
        break;
      default:
        logStatus = "failed";
    }

    demoStore.addAutomationLog({
      workflowId: `n8n_${action}`,
      returnId: returnRequest._id,
      action: `n8n webhook: ${action}`,
      status: logStatus,
      details: JSON.stringify(data || {}),
    });

    return NextResponse.json({ success: true, status: returnRequest.status });
  } catch (error) {
    console.error("n8n webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
