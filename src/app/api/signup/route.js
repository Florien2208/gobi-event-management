// app/api/signup/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { createSession } from "@/lib/session";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password, role } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      ...(role === "admin"
        ? {
            adminFields: {
              department: body.department,
              accessLevel: 1,
            },
          }
        : {
            userFields: {
              preferences: {
                notifications: true,
                newsletter: false,
              },
            },
          }),
    });

    // Create session
    const session = await createSession(user._id);

    // Return success response with session
    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": `session=${session}; Path=/; HttpOnly; Secure; SameSite=Strict`,
        },
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}
