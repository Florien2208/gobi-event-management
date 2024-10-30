// app/api/health/route.js
import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/health-check";

export async function GET() {
  try {
    const startTime = Date.now();

    // Check database connection
    const dbStatus = await checkDatabaseConnection();

    // Basic server info
    const serverInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
    };

    // Response time calculation
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: "online",
      responseTime: `${responseTime}ms`,
      server: serverInfo,
      database: dbStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
