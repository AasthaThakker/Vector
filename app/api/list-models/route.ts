import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: "GEMINI_API_KEY not configured",
        message: "Please add GEMINI_API_KEY to your .env.local file"
      }, { status: 500 });
    }

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // List available models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to list models: ${data.error?.message || response.statusText}`);
    }

    // Filter for models that support generateContent
    const supportedModels = data.models?.filter((model: any) => 
      model.supportedGenerationMethods?.includes("generateContent")
    ) || [];

    // Find vision models (ones that can handle images)
    const visionModels = supportedModels.filter((model: any) => 
      model.name.includes("vision") || 
      model.name.includes("gemini-1.5") ||
      model.name.includes("pro-vision")
    ) || [];

    return NextResponse.json({
      success: true,
      totalModels: data.models?.length || 0,
      supportedModels: supportedModels.length,
      visionModels: visionModels.length,
      allModels: data.models?.map((model: any) => ({
        name: model.name.split('/').pop(),
        displayName: model.displayName,
        description: model.description,
        supportsGeneration: model.supportedGenerationMethods?.includes("generateContent") || false,
        isVisionModel: model.name.includes("vision") || model.name.includes("1.5")
      })) || [],
      recommendedVisionModels: visionModels.map((model: any) => model.name.split('/').pop()) || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error listing models:", error);
    return NextResponse.json({
      error: "Failed to list models",
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
