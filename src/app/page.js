import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const features = [
    {
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      title: "Browse Events",
      description: "Discover exciting events happening in your area",
    },
    {
      icon: <Users className="w-6 h-6 text-green-500" />,
      title: "Easy Booking",
      description: "Book seats instantly with real-time availability",
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      title: "Real-time Updates",
      description: "Stay informed with live seat availability updates",
    },
    {
      icon: <Search className="w-6 h-6 text-orange-500" />,
      title: "Search & Filter",
      description: "Find the perfect event that matches your interests",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              EventHub
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/events">
              <Button variant="ghost">Browse Events</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost"> Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Discover & Book Amazing Events
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of people discovering exciting events every day.
            Browse upcoming events or create your own as an event organizer.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Browse Events
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Organize Event
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-none shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-6">
                <div className="rounded-full bg-gray-50 w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>© 2024 EventHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
