// app/api/events/delete/[id]/route.js
import Event from "@/models/Event";
import { verifyAuth } from "@/lib/session";

export async function DELETE(req, { params }) {
  const session = await verifyAuth();
  if (session.user.role !== "admin") throw new Error("Unauthorized");

  const { id } = params;
  await Event.findByIdAndDelete(id);

  return new Response("Event deleted", { status: 204 });
}
