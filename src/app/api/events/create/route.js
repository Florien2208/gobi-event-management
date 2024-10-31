// app/api/events/create/route.js
import Event from "@/models/Event";
import { verifyAuth } from "@/lib/session";

export async function POST(req) {
  const session = await verifyAuth();
  if (session.user.role !== "admin") throw new Error("Unauthorized");

  const data = await req.json();
  const newEvent = new Event(data);

  await newEvent.save();
  return new Response(JSON.stringify(newEvent), { status: 201 });
}
