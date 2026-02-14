import { NextRequest, NextResponse } from "next/server";
import { validateReturnWithGemini, ValidationResult } from "@/lib/geminiReturnValidator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, description } = body;

    if (!imageUrl || !description) {
      return NextResponse.json({ 
        error: "Missing required fields: imageUrl, description" 
      }, { status: 400 });
    }

    // Perform AI validation immediately
    const validationResult: ValidationResult = await validateReturnWithGemini(imageUrl, description);

    return NextResponse.json({
      success: true,
      validation: validationResult,
      canSubmit: validationResult.confidence >= 0.30, // Minimum 30% confidence required
      message: validationResult.confidence >= 0.30 
        ? "AI validation passed - you can submit your return"
        : "AI validation indicates low confidence - please provide more accurate description or clearer image"
    });

  } catch (error) {
    console.error("Immediate AI validation error:", error);
    
    return NextResponse.json({ 
      success: false,
      error: "AI validation service temporarily unavailable",
      canSubmit: false,
      message: "Please try again later or contact support"
    }, { status: 500 });
  }
}
