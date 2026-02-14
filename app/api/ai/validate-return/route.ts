import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Return from "@/models/Return";
import { validateReturnWithGemini, ValidationResult } from "@/lib/geminiReturnValidator";

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

    // Perform AI validation
    const validationResult: ValidationResult = await validateReturnWithGemini(imageUrl, description);

    // Determine validation status based on AI result
    let validationStatus: "approved" | "rejected_ai" | "manual_review";
    let fraudFlag = false;

    if (validationResult.match && validationResult.confidence >= 0.30) {
      validationStatus = "approved";
    } else if (!validationResult.match && validationResult.confidence >= 0.30) {
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
      aiAnalysisResult: {
        match: validationResult.match,
        confidence: validationResult.confidence,
        reason: validationResult.reason,
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
        details: `Status: ${validationStatus}, Confidence: ${validationResult.confidence}, Reason: ${validationResult.reason}`,
        timestamp: new Date(),
      });
    } catch (logError) {
      console.error("Failed to log AI validation:", logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      validationStatus,
      confidence: validationResult.confidence,
      reason: validationResult.reason
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
          aiAnalysisResult: {
            match: false,
            confidence: 0,
            reason: "AI validation service error - manual review required",
            analyzedAt: new Date()
          }
        });
      }
    } catch (updateError) {
      console.error("Failed to update return validationStatus after AI error:", updateError);
    }

    return NextResponse.json({ 
      error: "AI validation service temporarily unavailable - return marked for manual review" 
    }, { status: 500 });
  }
}
