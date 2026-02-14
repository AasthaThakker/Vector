import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ValidationResult {
  match: boolean;
  confidence: number;
  reason: string;
}

export async function validateReturnWithGemini(imageUrl: string, description: string): Promise<ValidationResult> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-robotics-er-1.5-preview" });

    // Fetch image data from URL
    let imageData: Buffer;
    let mimeType: string;

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      imageData = Buffer.from(arrayBuffer);
      
      // Determine MIME type from response headers or default to jpeg
      mimeType = response.headers.get('content-type') || 'image/jpeg';
    } catch (fetchError) {
      console.error("Error fetching image:", fetchError);
      throw new Error("Failed to fetch image for analysis");
    }

    const prompt = `You are a product return fraud detection system.

Analyze the provided product image and the user's return description.

Determine whether the description accurately matches the visible product condition or damage.

Return response in JSON format only:

{
"match": true or false,
"confidence": number between 0 and 1,
"reason": "short explanation"
}

Confidence represents how strongly the image and description match.

If mismatch confidence exceeds 0.30, mark match as false.

User description: "${description}"`;

    // Prepare the image for Gemini
    const imagePart = {
      inlineData: {
        data: imageData.toString('base64'),
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let parsedResult: ValidationResult;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      
      parsedResult = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (typeof parsedResult.match !== 'boolean' || 
          typeof parsedResult.confidence !== 'number' || 
          typeof parsedResult.reason !== 'string') {
        throw new Error("Invalid response structure");
      }

      // Ensure confidence is between 0 and 1
      parsedResult.confidence = Math.max(0, Math.min(1, parsedResult.confidence));
      
      // Apply the 0.30 threshold rule (minimum 30% confidence required)
      if (parsedResult.confidence < 0.30) {
        parsedResult.match = false;
      }

    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.error("Raw response:", text);
      
      // Fallback to manual review if parsing fails
      return {
        match: false,
        confidence: 0,
        reason: "AI analysis failed - manual review required"
      };
    }

    return parsedResult;

  } catch (error) {
    console.error("Gemini validation error:", error);
    
    // Return fallback result for manual review
    return {
      match: false,
      confidence: 0,
      reason: "AI validation service unavailable - manual review required"
    };
  }
}
