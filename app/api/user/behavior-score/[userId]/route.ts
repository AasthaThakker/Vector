import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { UserBehaviorService } from "@/lib/userBehaviorService";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    // Users can only check their own behavior score, admins can check any
    if (session.role !== "admin" && session.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const behaviorScore = await UserBehaviorService.calculateUserBehaviorScore(userId);
    
    return NextResponse.json(behaviorScore);

  } catch (error) {
    console.error("Error fetching user behavior score:", error);
    return NextResponse.json({ 
      error: "Failed to fetch user behavior score" 
    }, { status: 500 });
  }
}
