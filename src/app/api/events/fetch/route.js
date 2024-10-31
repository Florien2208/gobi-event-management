// app/api/events/fetch/route.js
import Event from "@/models/Event";

export async function GET() {
  const events = await Event.find({});
  return new Response(JSON.stringify(events), { status: 200 });
}
