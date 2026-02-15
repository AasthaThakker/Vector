import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { updateUserTrustScore, batchUpdateTrustScores } from "@/lib/trustScoreService";
import User from "@/models/User";

// GET - Get user's trust score breakdown
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Only admins can check other users' trust scores
    if (userId && session.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = userId || session.userId;

    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get fresh trust score calculation
    const trustScoreBreakdown = await updateUserTrustScore(targetUserId);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      trustScore: trustScoreBreakdown
    });

  } catch (error) {
    console.error("Error fetching trust score:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// POST - Update trust score (manual trigger or batch update)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { action, userId } = body;

    if (action === 'batch') {
      // Batch update all users
      const result = await batchUpdateTrustScores();
      
      return NextResponse.json({
        success: true,
        message: "Batch trust score update completed",
        ...result
      });
    } else if (action === 'single' && userId) {
      // Update specific user
      const trustScoreBreakdown = await updateUserTrustScore(userId);
      
      return NextResponse.json({
        success: true,
        message: "Trust score updated successfully",
        trustScore: trustScoreBreakdown
      });
    } else {
      return NextResponse.json({ 
        error: "Invalid request. Use action: 'batch' or action: 'single' with userId" 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Error updating trust score:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// PUT - Manual trust score adjustment (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { userId, newScore, reason } = body;

    if (!userId || typeof newScore !== 'number' || newScore < 0 || newScore > 100) {
      return NextResponse.json({ 
        error: "Invalid input. Provide userId and newScore (0-100)" 
      }, { status: 400 });
    }

    // Get current user for old score
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's trust score manually
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        trustScore: newScore,
        trustScoreUpdatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    // Log the manual adjustment
    console.log(`Manual trust score adjustment for user ${userId}: ${currentUser.trustScore} -> ${newScore} by admin ${session.userId}`);

    return NextResponse.json({
      success: true,
      message: "Trust score adjusted manually",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        oldTrustScore: currentUser.trustScore,
        newTrustScore: user.trustScore
      }
    });

  } catch (error) {
    console.error("Error adjusting trust score:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
