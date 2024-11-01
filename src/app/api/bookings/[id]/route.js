// app/api/bookings/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import Booking from "@/models/Booking";
import Event from "@/models/Event";

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const booking = await Booking.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Return seats to event
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { availableSeats: booking.seats },
    });

    await booking.deleteOne();

    return NextResponse.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
