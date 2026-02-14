import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import AutomationLog from "@/models/AutomationLog";
import QRCode from "qrcode";

// Async function to trigger AI validation
async function triggerAIValidation(returnId: string, imageUrl: string, description: string) {
  try {
    const validationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/validate-return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        description,
        returnId
      })
    });

    if (!validationResponse.ok) {
      console.error('AI validation request failed:', validationResponse.statusText);
      return;
    }

    const result = await validationResponse.json();
    console.log('AI validation completed:', result);
  } catch (error) {
    console.error('Error triggering AI validation:', error);
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let returns;
    if (session.role === "admin" || session.role === "warehouse" || session.role === "logistics") {
      returns = await Return.find({}).sort({ createdAt: -1 }).populate('userId', 'name email');
    } else {
      returns = await Return.find({ userId: session.userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ returns });
  } catch (error) {
    console.error("Returns fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, productId, reason, description, imageUrl, returnMethod, dropboxLocation } = body;

    if (!orderId || !productId || !reason || !returnMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const returnRequest = await Return.create({
      orderId,
      userId: session.userId,
      productId,
      reason,
      description: description || "",
      imageUrl: imageUrl || "",
      returnMethod,
      qrCodeData: "", // Empty initially, will be generated on approval
      dropboxLocation: dropboxLocation || "",
      status: "pending",
      validationStatus: "pending",
    });

    // Log automation event
    await AutomationLog.create({
      workflowId: "return_request_created",
      returnId: returnRequest._id,
      action: "Return request submitted",
      status: "success",
      details: `Return created for product ${productId} via ${returnMethod}`,
      timestamp: new Date(),
    });

    // Trigger AI validation immediately if image and description are provided
    if (imageUrl && description) {
      // Run AI validation in background without blocking the response
      triggerAIValidation(returnRequest._id.toString(), imageUrl, description).catch(error => {
        console.error('Background AI validation failed:', error);
      });
    }

    return NextResponse.json({ return: returnRequest }, { status: 201 });
  } catch (error) {
    console.error("Return creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
