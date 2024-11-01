// app/admin/events/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminEvents() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    availableSeats: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    router.push("/login");
    return null;
  }

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `/api/events/${selectedEvent._id}`
        : "/api/events";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id: selectedEvent?._id, // Add event ID for update
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      setIsModalOpen(false);
      setSelectedEvent(null);
      setIsEditing(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        availableSeats: "",
      });
      fetchEvents();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete event");
      setShowDeleteConfirm(null);
      fetchEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      availableSeats: event.availableSeats,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      availableSeats: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Information and Logout Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          {session && (
            <p className="text-gray-600">
              Logged in as {session.user.name} ({session.user.email})
            </p>
          )}
        </div>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={handleCreateNew}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <span className="mr-2">+</span>
          Create Event
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="text-sm text-gray-500 mb-4">
              <p>Date: {new Date(event.date).toLocaleString()}</p>
              <div className="flex justify-between">
                <div>
                  <p>Total Seats: {event.availableSeats}</p>
                  <p>Booked Seats: {event.bookedSeats}</p>
                  <p>
                    Remaining Seats: {event.availableSeats - event.bookedSeats}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleEdit(event)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(event._id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Event" : "Create New Event"}
            </h2>
            <form onSubmit={handleCreateOrEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Available Seats
                  </label>
                  <input
                    type="number"
                    value={formData.availableSeats}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableSeats: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {isEditing ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Delete Event</h2>
            <p className="mb-4">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
