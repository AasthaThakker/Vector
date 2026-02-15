import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// GET - Get all users' trust scores (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    await connectDB();

    // Get all users with their trust scores
    const users = await User.find({}, 'name email trustScore role').lean();

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        success: true,
        averageTrustScore: 0,
        totalUsers: 0,
        users: []
      });
    }

    // Calculate average trust score
    const totalTrustScore = users.reduce((sum, user) => sum + (user.trustScore || 0), 0);
    const averageTrustScore = totalTrustScore / users.length;

    // Get trust score distribution
    const trustScoreDistribution = {
      low: users.filter(user => (user.trustScore || 0) < 40).length,
      medium: users.filter(user => (user.trustScore || 0) >= 40 && (user.trustScore || 0) <= 70).length,
      high: users.filter(user => (user.trustScore || 0) > 70).length
    };

    return NextResponse.json({
      success: true,
      averageTrustScore: Math.round(averageTrustScore * 100) / 100, // Round to 2 decimal places
      totalUsers: users.length,
      trustScoreDistribution,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore || 0
      }))
    });

  } catch (error) {
    console.error("Error fetching users trust scores:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
