import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing OpenRouter API connection...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant. Respond with only 'TEST_OK'."
          },
          {
            role: "user",
            content: "Return Reason: wrong_color\nDescription: ddddd\n\nDo these match?"
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      })
    });

    const data = await response.json();
    console.log("Test response:", data);
    
    const result = data.choices?.[0]?.message?.content?.trim().toUpperCase();
    console.log("Test result:", result);

    return NextResponse.json({ 
      success: true,
      status: response.status,
      result: result,
      fullResponse: data
    });

  } catch (error) {
    console.error("Test failed:", error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
