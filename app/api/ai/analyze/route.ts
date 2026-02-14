import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/aiService";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, description } = await req.json();

    if (!imageUrl || !description) {
      return NextResponse.json({ error: "imageUrl and description are required" }, { status: 400 });
    }

    const result = await analyzeImage(imageUrl, description);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
