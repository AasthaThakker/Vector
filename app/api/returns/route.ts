import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import AutomationLog from "@/models/AutomationLog";
import Order from "@/models/Order";
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
      returns = await Return.find({}).sort({ createdAt: -1 }).populate('userId', 'name email').populate('orderId');
    } else {
      returns = await Return.find({ userId: session.userId }).sort({ createdAt: -1 }).populate('orderId');
    }

    // Extract product prices from orders and calculate risk scores
    const returnsWithPricesAndRisk = returns.map(returnItem => {
      const order = returnItem.orderId as any;
      let productPrice = 0;
      
      if (order && order.products) {
        const product = order.products.find((p: any) => p.productId === returnItem.productId);
        if (product) {
          productPrice = product.price;
        }
      }
      
      // Calculate risk score based on return reason
      let riskScore = 50; // Default medium risk
      let aiConfidence = 0.85; // Default confidence
      
      switch (returnItem.reason) {
        case 'wrong_size':
          riskScore = 25; // Low risk - easy to restock
          aiConfidence = 0.95;
          break;
        case 'changed_mind':
          riskScore = 20; // Very low risk - product usually fine
          aiConfidence = 0.90;
          break;
        case 'defective':
          riskScore = 85; // High risk - quality issue
          aiConfidence = 0.88;
          break;
        case 'wrong_item':
          riskScore = 60; // Medium-high risk - process error
          aiConfidence = 0.92;
          break;
        case 'damaged_shipping':
          riskScore = 75; // High risk - shipping damage
          aiConfidence = 0.87;
          break;
        case 'quality_issue':
          riskScore = 70; // Medium-high risk
          aiConfidence = 0.83;
          break;
        case 'not_as_described':
          riskScore = 55; // Medium risk
          aiConfidence = 0.80;
          break;
      }
      
      return {
        ...returnItem.toObject(),
        price: productPrice,
        riskScore,
        aiConfidence
      };
    });

    return NextResponse.json({ returns: returnsWithPricesAndRisk });
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

    // Get the order to find the product price
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Find the product in the order to get its price
    const product = order.products.find(p => p.productId === productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found in order" }, { status: 404 });
    }

    const returnRequest = await Return.create({
      orderId,
      userId: session.userId,
      productId,
      reason,
      description: description || "",
      imageUrl: imageUrl || "",
      price: product.price,
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
