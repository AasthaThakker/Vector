import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import AutomationLog from "@/models/AutomationLog";

export async function POST(req: NextRequest) {
  try {
    const { returnId, userId } = await req.json();

    if (!returnId) {
      return NextResponse.json({ error: "returnId is required" }, { status: 400 });
    }

    await connectDB();

    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    if (returnRequest.returnMethod !== "dropbox") {
      return NextResponse.json({ error: "This return is not a dropbox return" }, { status: 400 });
    }

    await Return.findByIdAndUpdate(returnId, { status: "dropbox_received" });

    await AutomationLog.create({
      workflowId: "dropbox_confirm",
      returnId: returnRequest._id,
      action: "Dropbox parcel confirmed",
      status: "success",
      details: `Confirmed by user ${userId || "unknown"} at dropbox location`,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Dropbox return confirmed",
      return: { ...returnRequest.toObject(), status: "dropbox_received" },
    });
  } catch (error) {
    console.error("Dropbox confirm error:", error);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
