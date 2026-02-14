import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AutomationLog from "@/models/AutomationLog";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const logs = await AutomationLog.find({}).sort({ timestamp: -1 });
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Automation logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
