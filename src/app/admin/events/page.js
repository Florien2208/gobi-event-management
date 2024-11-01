"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Users,
  AlertCircle,
  LogOut,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-[250px]"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-40 bg-slate-200 rounded col-span-1"></div>
            <div className="h-40 bg-slate-200 rounded col-span-1"></div>
            <div className="h-40 bg-slate-200 rounded col-span-1"></div>
          </div>
        </div>
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
          id: selectedEvent?._id,
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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await signOut({
        redirect: false,
        callbackUrl: "/login",
      });
      localStorage.clear();
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 0);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <Card className="mb-8">
          <CardContent className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {session.user.name?.[0] || session.user.email?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Events Management</h1>
                <p className="text-gray-500">
                  Admin: {session.user.name} ({session.user.email})
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="mb-8">
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const bookedPercentage =
              (event.bookedSeats / event.availableSeats) * 100;
            return (
              <Card
                key={event._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <Badge
                    variant={bookedPercentage >= 90 ? "destructive" : "default"}
                  >
                    {bookedPercentage >= 90 ? "Almost Full" : "Available"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{event.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Seats Booked: {event.bookedSeats}/
                          {event.availableSeats}
                        </span>
                      </div>
                      <Progress value={bookedPercentage} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(event._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrEdit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Available Seats</label>
                  <Input
                    type="number"
                    value={formData.availableSeats}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableSeats: e.target.value,
                      })
                    }
                    min="0"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Save Changes" : "Create Event"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!showDeleteConfirm}
          onOpenChange={() => setShowDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this event? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-700"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
