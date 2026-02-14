import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();
    
    const orders = await Order.find({}).sort({ orderDate: -1 }).limit(10).populate('userId', 'name email');
    
    return NextResponse.json({ 
      message: "Orders retrieved successfully",
      totalOrders: orders.length,
      orders: orders 
    });
  } catch (error) {
    console.error("Test orders error:", error);
    return NextResponse.json({ 
      error: "Failed to retrieve orders", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
