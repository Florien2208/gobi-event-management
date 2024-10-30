// app/signup/success/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SignupSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Registration Successful!
          </h2>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Thank you for signing up! You will be redirected to the dashboard in
            a few seconds.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Go to Dashboard Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
