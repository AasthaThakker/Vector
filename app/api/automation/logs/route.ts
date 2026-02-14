import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

import { demoStore } from "@/lib/demo-store";



export async function GET() {

  try {

    const session = await getSession();

    if (!session || session.role !== "admin") {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    }



    const logs = demoStore.getAllAutomationLogs();

    return NextResponse.json({ logs });

  } catch (error) {

    console.error("Automation logs error:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });

  }

}

