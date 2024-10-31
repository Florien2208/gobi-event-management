// components/admin/EventForm.jsx
"use client";
import { useState } from "react";

export default function EventForm({ onSubmit, event }) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date || "",
    availableSeats: event?.availableSeats || 0,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        required
      />
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="availableSeats"
        value={formData.availableSeats}
        onChange={handleChange}
        required
      />
      <button type="submit">Save Event</button>
    </form>
  );
}
