import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !["admin", "warehouse"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const inventory = await Inventory.find({});
    return NextResponse.json({ inventory });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "warehouse") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { productId, stock } = await req.json();
    const item = await Inventory.findOneAndUpdate(
      { productName: productId },
      { stock },
      { new: true }
    );

    return NextResponse.json({ inventory: item });
  } catch (error) {
    console.error("Inventory update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
