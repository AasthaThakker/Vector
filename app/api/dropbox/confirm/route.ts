import { NextRequest, NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";

export async function POST(req: NextRequest) {
  try {
    const { returnId, userId } = await req.json();

    if (!returnId) {
      return NextResponse.json({ error: "returnId is required" }, { status: 400 });
    }

    const returnRequest = demoStore.findReturnById(returnId);
    if (!returnRequest) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    if (returnRequest.returnMethod !== "dropbox") {
      return NextResponse.json({ error: "This return is not a dropbox return" }, { status: 400 });
    }

    demoStore.updateReturnStatus(returnId, "dropbox_received");

    demoStore.addAutomationLog({
      workflowId: "dropbox_confirm",
      returnId: returnRequest._id,
      action: "Dropbox parcel confirmed",
      status: "success",
      details: `Confirmed by user ${userId || "unknown"} at dropbox location`,
    });

    return NextResponse.json({
      success: true,
      message: "Dropbox return confirmed",
      return: returnRequest,
    });
  } catch (error) {
    console.error("Dropbox confirm error:", error);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
