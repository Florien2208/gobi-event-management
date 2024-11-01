"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingEvent, setBookingEvent] = useState(null);
  const [seats, setSeats] = useState(1);
  const [bookingStatus, setBookingStatus] = useState({
    success: false,
    message: "",
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch events");
      }
      const data = await res.json();
      setEvents(data);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Fetch events error:", err);
    } finally {
      setLoading(false);
    }
  },[]);

const fetchMyBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings/my-bookings");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch bookings");
      }
      const data = await res.json();
      setMyBookings(data);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  },[]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (activeTab === "events") {
        fetchEvents();
      } else {
        fetchMyBookings();
      }
    }
  }, [status, activeTab, router, fetchEvents, fetchMyBookings]);

 const handleLogout = async () => {
   try {
     await signOut({
       redirect: false,
     });

     // Clear any local storage or cookies if needed
     localStorage.clear();

     // Redirect to login page
     router.push("/login");
     router.refresh();
   } catch (error) {
     console.error("Logout error:", error);
   }
 };

  const handleBooking = async () => {
    try {
      setBookingStatus({ success: false, message: "" });

      if (!bookingEvent?._id) {
        throw new Error("Invalid event selected");
      }

      if (!seats || seats < 1) {
        throw new Error("Please select at least 1 seat");
      }

      if (seats > bookingEvent.availableSeats) {
        throw new Error(`Only ${bookingEvent.availableSeats} seats available`);
      }
      const createdBy = session.user.name;
      console.log("seatsssssssssssss", createdBy);
      const res = await fetch(`/api/events/${bookingEvent._id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seats, createdBy }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book event");
      }

      setBookingStatus({
        success: true,
        message: `Successfully booked ${seats} seat${seats > 1 ? "s" : ""}!`,
      });

      await fetchEvents();
      if (activeTab === "bookings") {
        await fetchMyBookings();
      }

      setSeats(1);
      setBookingEvent(null);
    } catch (err) {
      console.error("Booking error:", err);
      setBookingStatus({
        success: false,
        message: err.message || "Failed to process booking",
      });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setBookingStatus({ success: false, message: "" });

      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      setBookingStatus({
        success: true,
        message: "Booking cancelled successfully",
      });

      await fetchMyBookings();
      await fetchEvents();
    } catch (err) {
      console.error("Cancel booking error:", err);
      setBookingStatus({
        success: false,
        message: err.message || "Failed to cancel booking",
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Info and Logout */}
      {session?.user && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold">
            Welcome, {session.user.name || session.user.email}!
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-8 border-b">
        <button
          className={`py-2 px-4 font-medium mr-4 ${
            activeTab === "events"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("events")}
        >
          Available Events
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "bookings"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("bookings")}
        >
          My Bookings
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Booking Status Display */}
      {bookingStatus.message && (
        <div
          className={`${
            bookingStatus.success
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          } px-4 py-3 rounded mb-4 border`}
        >
          {bookingStatus.message}
        </div>
      )}

      {/* Events List */}
      {activeTab === "events" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  <p>Date: {new Date(event.date).toLocaleString()}</p>
                  <p>
                    Available Seats: {event.availableSeats - event.bookedSeats}
                  </p>
                  <p>Booked Seats: {event.bookedSeats}</p>
                </div>
                <button
                  className={`w-full py-2 px-4 rounded font-bold ${
                    event.availableSeats < 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-700 text-white"
                  }`}
                  disabled={event.availableSeats < 1}
                  onClick={() => setBookingEvent(event)}
                >
                  {event.availableSeats < 1 ? "Sold Out" : "Book Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // My Bookings List
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              You haven&apos;t booked any events yet.
            </div>
          ) : (
            myBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {booking.event?.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {booking.event?.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>
                        Date: {new Date(booking.event?.date).toLocaleString()}
                      </p>
                      <p>Number of Seats: {booking.seats}</p>
                      <p>
                        Booking Date:{" "}
                        {new Date(booking.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Book Event: {bookingEvent.title}
            </h2>
            <div className="space-y-4">
              <p>Available seats: {bookingEvent.availableSeats}</p>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Seats
                </label>
                <input
                  type="number"
                  min="1"
                  max={bookingEvent.availableSeats}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setBookingEvent(null);
                  setSeats(1);
                  setBookingStatus({ success: false, message: "" });
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
