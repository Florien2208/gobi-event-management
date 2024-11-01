import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import Event from "@/models/Event";
import Booking from "@/models/Booking";

export async function POST(request, context) {
  try {
    // Get session and verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Make sure we have a user ID
    if (!session.user?.id) {
      console.error("No user ID in session:", session);
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    await dbConnect();

    const id = context.params.id;
    const { seats } = await request.json();

    // Validate seats
    if (!seats || seats < 1) {
      return NextResponse.json(
        { error: "Invalid number of seats" },
        { status: 400 }
      );
    }

    // Find and verify event
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check seat availability
    if (event.availableSeats < seats) {
      return NextResponse.json(
        { error: "Not enough seats available" },
        { status: 400 }
      );
    }

    // Create booking with explicit user ID
    const booking = await Booking.create({
      event: id,
      userId: session.user.id,
      seats: seats,
      createdAt: new Date(),
    });

    // Update event seats
    // event.availableSeats -= seats;
    event.bookedSeats += seats;
    await event.save();

    // Return successful response with booking details
    return NextResponse.json({
      message: "Booking successful",
      booking: {
        _id: booking._id,
        event: event,
        seats: booking.seats,
        createdAt: booking.createdAt,
      },
      availableSeats: event.availableSeats,
      bookedSeats: event.bookedSeats,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 400 }
    );
  }
}
