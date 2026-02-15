import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import AutomationLog from "@/models/AutomationLog";
import Order from "@/models/Order";
import QRCode from "qrcode";
import { processReturnWithML } from "@/lib/mlPredictionService";

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

    // Extract product prices from orders and get user trust scores
    const returnsWithPricesAndRisk = await Promise.all(returns.map(async (returnItem) => {
      const order = returnItem.orderId as any;
      let productPrice = 0;
      
      if (order && order.products) {
        const product = order.products.find((p: any) => p.productId === returnItem.productId);
        if (product) {
          productPrice = product.price;
        }
      }
      
      // Get user trust score from database
      const { default: User } = await import('@/models/User');
      const user = await User.findById(returnItem.userId);
      const trustScore = user?.trustScore || 100;
      
      // Get ML analysis results if available
      const mlAnalysis = returnItem.mlAnalysisResult || {
        fraudScore: 0.3,
        confidence: 0.85,
        riskLevel: 'low'
      };
      
      return {
        ...returnItem.toObject(),
        price: productPrice,
        trustScore, // User's trust score
        riskScore: Math.round(mlAnalysis.fraudScore * 100), // Convert to 0-100 scale
        aiConfidence: mlAnalysis.confidence,
        mlRiskLevel: mlAnalysis.riskLevel,
        mlPrediction: mlAnalysis.match !== false ? 'LEGITIMATE' : 'FRAUD'
      };
    }));

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

    // AI validation check for reason-description similarity using Python ML model
    if (reason && description) {
      console.log("Starting Python ML validation for:", { reason, description });
      
      try {
        // Get user's return history for ML analysis
        const userReturns = await Return.find({ userId: session.userId })
          .sort({ createdAt: -1 })
          .limit(10); // Get last 10 returns for ML analysis
        
        // Create new return object for ML prediction
        const newReturnData = {
          reason,
          description,
          price: product.price,
          imageUrl: imageUrl || '',
          orderId,
          productId
        };
        
        // Process with ML model
        const mlResult = await processReturnWithML(newReturnData, session.userId);
        console.log("Python ML prediction result:", mlResult);
        
        // Block submission if ML model detects high fraud risk
        if (mlResult.mlResult.prediction === "FRAUD" && mlResult.mlResult.risk_score > 0.7) {
          console.log("BLOCKED: Python ML detected high fraud risk");
          return NextResponse.json({ 
            error: `ML validation failed: High fraud risk detected (${mlResult.mlResult.risk_score}). Please contact support for assistance.` 
          }, { status: 400 });
        }
        
        // Flag for manual review if suspicious or medium risk
        if (mlResult.mlResult.prediction === "SUSPICIOUS" || mlResult.mlResult.risk_score > 0.4) {
          console.log("FLAGGED: Python ML detected suspicious activity - will require manual review");
          // We'll still allow submission but mark it for manual review
        } else {
          console.log("Python ML validation passed");
        }
        
      } catch (error) {
        console.error("ERROR: Python ML validation failed:", error);
        // If ML fails completely, allow submission but log it
        console.log("ML validation error, allowing submission to continue");
      }
    } else {
      console.log("Skipping ML validation - missing reason or description");
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

    // ML processing is already done above and trust score is updated automatically
    console.log(`Return created successfully with ML processing for user ${session.userId}`);

    return NextResponse.json({ return: returnRequest }, { status: 201 });
  } catch (error) {
    console.error("Return creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
