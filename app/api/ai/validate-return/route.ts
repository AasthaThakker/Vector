import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import { predictWithLocalModel } from "@/lib/mlPredictionService";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl, description, returnId } = body;

    if (!imageUrl || !description || !returnId) {
      return NextResponse.json({ 
        error: "Missing required fields: imageUrl, description, returnId" 
      }, { status: 400 });
    }

    await connectDB();

    // Find the return request
    const returnRequest = await Return.findById(returnId);
    if (!returnRequest) {
      return NextResponse.json({ error: "Return request not found" }, { status: 404 });
    }

    // Verify ownership (admin can validate any return)
    if (session.role !== "admin" && session.role !== "warehouse" && 
        returnRequest.userId.toString() !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's return history for behavior analysis
    const userReturns = await Return.find({ userId: returnRequest.userId })
      .sort({ createdAt: -1 })
      .limit(10); // Get last 10 returns for behavior analysis
    
    // Perform ML validation using local model
    const mlResult = await predictWithLocalModel(
      returnRequest.reason || '',
      description,
      userReturns
    );

    // Determine validation status based on ML result
    let validationStatus: "approved" | "rejected_ai" | "manual_review";
    let fraudFlag = false;

    if (mlResult.match && mlResult.fraudScore < 0.4) {
      validationStatus = "approved";
    } else if (!mlResult.match && mlResult.fraudScore > 0.6) {
      validationStatus = "rejected_ai";
      fraudFlag = true;
    } else {
      validationStatus = "manual_review";
    }

    // Update the return request with AI analysis results
    // Note: We only update validationStatus and fraudFlag, not the main status
    // The main status is controlled by admin approval process
    await Return.findByIdAndUpdate(returnId, {
      validationStatus: validationStatus,
      fraudFlag: fraudFlag,
      mlAnalysisResult: {
        match: mlResult.match,
        confidence: mlResult.confidence,
        fraudScore: mlResult.fraudScore,
        riskLevel: mlResult.riskLevel,
        reason: mlResult.reason,
        analyzedAt: new Date()
      }
    });

    // Log the validation for audit purposes
    try {
      const { default: AutomationLog } = await import("@/models/AutomationLog");
      await AutomationLog.create({
        workflowId: "ai_validation",
        returnId: returnId,
        action: "AI validation completed",
        status: "success",
        details: `Status: ${validationStatus}, Confidence: ${mlResult.confidence}, Fraud Score: ${mlResult.fraudScore}, Risk Level: ${mlResult.riskLevel}, Reason: ${mlResult.reason}`,
        timestamp: new Date(),
      });
    } catch (logError) {
      console.error("Failed to log AI validation:", logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      validationStatus,
      confidence: mlResult.confidence,
      fraudScore: mlResult.fraudScore,
      riskLevel: mlResult.riskLevel,
      reason: mlResult.reason
    });

  } catch (error) {
    console.error("AI validation error:", error);
    
    // If AI validation fails, set validationStatus to manual review
    try {
      const body = await req.json().catch(() => ({}));
      const { returnId } = body;
      
      if (returnId) {
        await connectDB();
        await Return.findByIdAndUpdate(returnId, {
          validationStatus: "manual_review",
          mlAnalysisResult: {
            match: false,
            confidence: 0,
            fraudScore: 0.5,
            riskLevel: "medium",
            reason: "ML validation service error - manual review required",
            analyzedAt: new Date()
          }
        });
      }
    } catch (updateError) {
      console.error("Failed to update return validationStatus after AI error:", updateError);
    }

    return NextResponse.json({ 
      error: "ML validation service temporarily unavailable - return marked for manual review" 
    }, { status: 500 });
  }
}
