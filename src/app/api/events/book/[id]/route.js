// app/api/events/book/[id]/route.js
import Event from "@/models/Event";

export async function POST(req, { params }) {
  const { id } = params;
  const event = await Event.findById(id);

  if (event && event.availableSeats > 0) {
    event.availableSeats -= 1;
    await event.save();
    return new Response(JSON.stringify(event), { status: 200 });
  }

  return new Response("No seats available", { status: 400 });
}
