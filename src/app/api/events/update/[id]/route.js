// app/api/events/update/[id]/route.js
import Event from "@/models/Event";
import { verifyAuth } from "@/lib/session";

export async function PATCH(req, { params }) {
  const session = await verifyAuth();
  if (session.user.role !== "admin") throw new Error("Unauthorized");

  const { id } = params;
  const data = await req.json();
  const event = await Event.findByIdAndUpdate(id, data, { new: true });

  return event
    ? new Response(JSON.stringify(event), { status: 200 })
    : new Response("Event not found", { status: 404 });
}
