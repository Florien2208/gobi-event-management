"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Clock, Info } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

  // Fetch functions remain the same
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
  }, []);

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
  }, []);

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
      localStorage.clear();
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
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        {session?.user && (
          <Card className="mb-8">
            <CardContent className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {session.user.name?.[0] || session.user.email?.[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    Welcome, {session.user.name || session.user.email}!
                  </h2>
                  <p className="text-sm text-gray-500">
                    Manage your events and bookings
                  </p>
                </div>
              </div>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs Section */}
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="events">Available Events</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          </TabsList>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {bookingStatus.message && (
            <Alert
              variant={bookingStatus.success ? "default" : "destructive"}
              className="mt-4"
            >
              <AlertDescription>{bookingStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Events Content */}
          <TabsContent value="events">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card
                  key={event._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{event.title}</span>
                      <Badge
                        variant={
                          event.availableSeats > 0 ? "default" : "secondary"
                        }
                      >
                        {event.availableSeats > 0 ? "Available" : "Sold Out"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{event.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>Available: {event.availableSeats}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Booked: {event.bookedSeats}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={event.availableSeats < 1}
                      onClick={() => setBookingEvent(event)}
                    >
                      {event.availableSeats < 1 ? "Sold Out" : "Book Now"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookings Content */}
          <TabsContent value="bookings">
            <div className="space-y-4">
              {myBookings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Info className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-center">
                      You haven&apos;t booked any events yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                myBookings.map((booking) => (
                  <Card key={booking._id}>
                    <CardContent className="flex justify-between items-start py-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold">
                            {booking.event?.title}
                          </h3>
                          <p className="text-gray-600">
                            {booking.event?.description}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(booking.event?.date).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span>Seats: {booking.seats}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>
                              Booked:{" "}
                              {new Date(booking.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        Cancel Booking
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Booking Dialog */}
        <Dialog
          open={!!bookingEvent}
          onOpenChange={() => setBookingEvent(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Event: {bookingEvent?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>Available seats: {bookingEvent?.availableSeats}</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Seats</label>
                <Input
                  type="number"
                  min="1"
                  max={bookingEvent?.availableSeats}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setBookingEvent(null);
                  setSeats(1);
                  setBookingStatus({ success: false, message: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleBooking}>Confirm Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
