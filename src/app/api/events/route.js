import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import Event from "@/models/Event";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    // Ensure bookedSeats is set to 0 when creating a new event
    const event = await Event.create({
      ...data,
      bookedSeats: 0,
      createdBy: session.user.id,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const events = await Event.find().sort({ date: 1 });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT route to update event with proper seat management
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await request.json();
    const data = await request.json();

    // Ensure bookedSeats is not manually set by admin
    delete data.bookedSeats;

    const event = await Event.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
