import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose, { ConnectionStates } from "mongoose";

export async function GET() {
  try {
    // Test MongoDB connection
    await connectDB();
    
    const connectionState = mongoose.connection.readyState;
    const connectionStates: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Test database operations
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database not available");
    }
    
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      connectionState: connectionStates[connectionState] || 'unknown',
      connectionStateCode: connectionState,
      database: mongoose.connection.name,
      collections: collections.map(c => c.name),
      message: "MongoDB connection successful"
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "MongoDB connection failed"
    }, { status: 500 });
  }
}
