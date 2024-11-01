// app/api/auth/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Perform any additional cleanup here
    // For example, invalidating tokens, clearing server-side session data, etc.

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
