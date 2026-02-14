import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import AutomationLog from "@/models/AutomationLog";
import QRCode from "qrcode";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    await connectDB();

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    // Role-based update validation
    if (session.role === "admin") {
      if (!["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Invalid status for admin" }, { status: 400 });
      }
      
      // Check AI validation results before approving
      if (status === "approved") {
        if (returnRequest.validationStatus === "rejected_ai" && returnRequest.fraudFlag) {
          return NextResponse.json({ 
            error: "Cannot approve return - AI validation detected potential fraud. Requires manual review." 
          }, { status: 400 });
        }
        
        if (returnRequest.validationStatus === "manual_review") {
          // Admin can still approve manual review cases, but log the override
          console.warn(`Admin ${session.email} approved return ${id} despite manual review status`);
        }
        
        // Generate QR code when admin approves the return
        const qrPayload = JSON.stringify({
          returnId: returnRequest._id,
          userId: returnRequest.userId,
          timestamp: new Date().toISOString(),
          status: "approved",
          returnMethod: returnRequest.returnMethod,
          dropboxLocation: returnRequest.dropboxLocation || "",
          approvedBy: session.email,
          approvedAt: new Date().toISOString()
        });
        
        const qrCodeData = await QRCode.toDataURL(qrPayload);
        returnRequest.qrCodeData = qrCodeData;
      }
    } else if (session.role === "warehouse") {
      if (!["warehouse_received", "refund_initiated", "rejected", "completed"].includes(status)) {
        return NextResponse.json({ error: "Invalid status for warehouse" }, { status: 400 });
      }
    } else if (session.role === "logistics") {
      if (!["pickup_scheduled", "pickup_completed"].includes(status)) {
        return NextResponse.json({ error: "Invalid status for logistics" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Not authorized to update returns" }, { status: 403 });
    }

    // Update the status
    returnRequest.status = status;
    const updated = await returnRequest.save();

    await AutomationLog.create({
      workflowId: `return_status_${status}`,
      returnId: id,
      action: `Status updated to ${status}`,
      status: "success",
      details: `Updated by ${session.role} (${session.email})${status === "approved" ? " - QR code generated" : ""}`,
      timestamp: new Date(),
    });

    return NextResponse.json({ return: updated });
  } catch (error) {
    console.error("Return update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
