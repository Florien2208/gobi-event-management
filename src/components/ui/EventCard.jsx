// components/ui/EventCard.jsx
"use client";
import { useState } from "react";
export default function EventCard({ event, onEdit, onDelete }) {
  const [availableSeats, setAvailableSeats] = useState(event.availableSeats);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/delete/${event._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete event");
      }

      if (onDelete) {
        onDelete(event._id);
      }
    } catch (err) {
      setError(err.message);
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          <p className="text-gray-600 mb-2">{event.description}</p>
          <p className="text-gray-500">
            Date: {new Date(event.date).toLocaleDateString()}
          </p>
          <p className="text-gray-500">Available Seats: {availableSeats}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(event)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors disabled:bg-gray-400"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

