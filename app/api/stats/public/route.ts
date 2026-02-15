import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Return from "@/models/Return";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const [
      ordersCount,
      returnsCount,
      usersCount,
      completedReturns,
      processedReturnsCount,
      fraudReturnsCount
    ] = await Promise.all([
      Order.countDocuments(),
      Return.countDocuments(),
      User.countDocuments(),
      Return.find({ status: "completed" }).select('createdAt updatedAt'),
      Return.countDocuments({ status: { $in: ['approved', 'rejected'] } }), // Processed returns
      Return.countDocuments({ fraudFlag: true }) // Fraudulent returns
    ]);

    const processedCount = processedReturnsCount; // Using the count directly
    const fraudCount = fraudReturnsCount; // Using the count directly

    // Calculate Average Resolution Time
    let totalResolutionTimeHours = 0;
    let resolutionCount = 0;

    completedReturns.forEach((ret: any) => {
      if (ret.createdAt && ret.updatedAt) {
        const diffMs = new Date(ret.updatedAt).getTime() - new Date(ret.createdAt).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        totalResolutionTimeHours += diffHours;
        resolutionCount++;
      }
    });

    const avgResolutionTime = resolutionCount > 0
      ? (totalResolutionTimeHours / resolutionCount).toFixed(1) + "h"
      : "24h"; // Default if no data

    // Calculate Return Rate (if orders exist)
    const returnRate = ordersCount > 0
      ? ((returnsCount / ordersCount) * 100).toFixed(1) + "%"
      : "0%";

    // Satisfaction logic
    let satisfaction = "95%";
    if (ordersCount > 10) {
      const satVal = ((ordersCount - returnsCount) / ordersCount) * 100;
      satisfaction = Math.max(80, Math.min(99, satVal)).toFixed(0) + "%";
    }

    // Processing Efficiency: (Processed Returns / Total Returns) * 100
    // If no returns, default to 100% (system ready)
    let efficiency = "98%";
    if (returnsCount > 0) {
      // Assume 'pending' returns are the backlog. 
      // Efficiency = 1 - (Pending / Total)
      // We need pending count. Let's approximate Processed / Total.
      const effVal = (processedCount / returnsCount) * 100;
      efficiency = Math.max(50, Math.min(100, effVal)).toFixed(0) + "%";
    }

    // Trust Score: 5.0 base, minus penalty for fraud/rejections
    // If no data, 4.9 default
    let trustScore = "4.9";
    if (returnsCount > 5) {
      // Penalty: (Fraud / Returns) * 20
      const penalty = (fraudCount / returnsCount) * 20; // e.g. 5% fraud = 1 point penalty
      const score = Math.max(3.0, 5.0 - penalty);
      trustScore = score.toFixed(1);
    }

    return NextResponse.json({
      returnsProcessed: returnsCount > 0 ? returnsCount.toLocaleString() : "0",
      activeUsers: usersCount > 0 ? usersCount.toLocaleString() : "0",
      avgResolutionTime,
      satisfaction,
      efficiency,
      trustScore,
      totalOrders: ordersCount.toLocaleString()
    });

  } catch (error) {
    console.error("Public stats fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
