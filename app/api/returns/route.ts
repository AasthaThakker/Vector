import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import AutomationLog from "@/models/AutomationLog";
import Order from "@/models/Order";
import QRCode from "qrcode";

// Async function to trigger AI validation
async function triggerAIValidation(returnId: string, imageUrl: string, description: string, userId: string, reason: string) {
  try {
    const validationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/validate-return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        description,
        returnId,
        userId,
        reason
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
    console.log("=== RETURN REQUEST START ===");
    
    const session = await getSession();
    if (!session) {
      console.log("ERROR: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Request body:", body);
    
    const { orderId, productId, reason, description, imageUrl, returnMethod, dropboxLocation } = body;

    if (!orderId || !productId || !reason || !returnMethod) {
      console.log("ERROR: Missing required fields", { orderId, productId, reason, returnMethod });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log("All required fields present, proceeding with validation");

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

    // AI validation check for reason-description similarity
    if (reason && description) {
      console.log("Starting AI validation for:", { reason, description });
      
      // Use AI for semantic validation
      try {
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Return Validation System"
          },
          body: JSON.stringify({
            "model": "openai/gpt-4o-mini",
            "messages": [
              {
                "role": "system",
                "content": `You are a return request validator. Determine if the description reasonably explains the return reason.

VALID EXAMPLES:
- wrong_size: "too tight", "too big", "doesn't fit", "this is too tight for me"
- wrong_color: "color is wrong", "different color", "not the color I ordered"
- defective: "broken", "not working", "stopped working", "damaged"
- wrong_item: "wrong item", "not what I ordered", "incorrect product"

INVALID EXAMPLES:
- wrong_color: "broken", "too small", "doesn't work"
- wrong_size: "wrong color", "defective", "not the right product"
- defective: "wrong size", "don't like it", "changed my mind"

Respond with ONLY "MATCH" or "MISMATCH". Be reasonable and practical.`
              },
              {
                "role": "user",
                "content": `Return Reason: ${reason}\nDescription: ${description}\n\nDoes this description reasonably explain the return reason? Respond MATCH or MISMATCH.`
              }
            ],
            "temperature": 0.1,
            "max_tokens": 10
          })
        });

        console.log("OpenRouter response status:", openRouterResponse.status);
        
        if (!openRouterResponse.ok) {
          const errorText = await openRouterResponse.text();
          console.log("ERROR: OpenRouter API call failed:", openRouterResponse.status, errorText);
          
          // If API fails, allow submission but log the error
          console.log("API failed, allowing submission for now");
        } else {
          const openRouterData = await openRouterResponse.json();
          console.log("OpenRouter response data:", openRouterData);
          
          const aiResult = openRouterData.choices?.[0]?.message?.content?.trim().toUpperCase();
          console.log("AI Result:", aiResult);

          if (aiResult === 'MISMATCH') {
            console.log("BLOCKED: AI detected mismatch");
            return NextResponse.json({ 
              error: "AI validation failed: Return reason and description do not match. Please contact support for assistance." 
            }, { status: 400 });
          } else if (aiResult && aiResult !== 'MATCH') {
            console.log("Unclear AI response, allowing submission:", aiResult);
          } else {
            console.log("AI validation passed");
          }
        }
      } catch (error) {
        console.error("ERROR: AI validation failed:", error);
        // If AI fails completely, allow submission but log it
        console.log("AI validation error, allowing submission to continue");
      }
    } else {
      console.log("Skipping AI validation - missing reason or description");
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
      triggerAIValidation(
        returnRequest._id.toString(), 
        imageUrl, 
        description, 
        session.userId, 
        reason
      ).catch(error => {
        console.error('Background AI validation failed:', error);
      });
    }

    return NextResponse.json({ return: returnRequest }, { status: 201 });
  } catch (error) {
    console.error("Return creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
