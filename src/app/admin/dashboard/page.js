// app/admin/dashboard/page.js
"use client";
import { useEffect, useState } from "react";
import EventForm from "@/components/admin/EventForm";
import EventCard from "@/components/ui/EventCard";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetch("/api/events/fetch")
      .then((res) => res.json())
      .then(setEvents);
  }, []);

  const handleSubmit = async (eventData) => {
    const method = editingEvent ? "PATCH" : "POST";
    const url = editingEvent
      ? `/api/events/update/${editingEvent._id}`
      : "/api/events/create";

    await fetch(url, { method, body: JSON.stringify(eventData) });
    setEditingEvent(null);
    fetchEvents();
  };

  const handleEdit = (event) => setEditingEvent(event);

  const handleDelete = async (id) => {
    await fetch(`/api/events/delete/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <EventForm onSubmit={handleSubmit} event={editingEvent} />
      <div>
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            onEdit={() => handleEdit(event)}
            onDelete={() => handleDelete(event._id)}
          />
        ))}
      </div>
    </div>
  );
}
