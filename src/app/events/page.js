// app/events/page.js
"use client";
import { useEffect, useState } from "react";
import EventCard from "@/components/ui/EventCard";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/api/events/fetch")
      .then((res) => res.json())
      .then(setEvents);
  }, []);

  return (
    <div>
      <h1>Available Events</h1>
      <div>
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}
