// components/ui/EventCard.jsx
"use client";
import { useState } from "react";

export default function EventCard({ event }) {
  const [availableSeats, setAvailableSeats] = useState(event.availableSeats);

  const handleBook = async () => {
    const response = await fetch(`/api/events/book/${event._id}`, {
      method: "POST",
    });

    if (response.ok) {
      const updatedEvent = await response.json();
      setAvailableSeats(updatedEvent.availableSeats);
    } else {
      alert("No seats available");
    }
  };

  return (
    <div className="card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>{new Date(event.date).toLocaleDateString()}</p>
      <p>Available Seats: {availableSeats}</p>
      <button onClick={handleBook} disabled={availableSeats === 0}>
        {availableSeats > 0 ? "Book Now" : "Sold Out"}
      </button>
    </div>
  );
}
