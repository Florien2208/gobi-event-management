// components/dev/ConnectionStatus.jsx
"use client";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Database, Server } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ConnectionStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV === "production") return null;
  if (loading) return <div>Checking connection status...</div>;

  const isHealthy =
    status?.database?.status === "success" && status?.status === "online";

  return (
    <Alert
      variant={isHealthy ? "default" : "destructive"}
      className="fixed bottom-4 right-4 w-96"
    >
      <AlertTitle className="flex items-center gap-2">
        {isHealthy ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        System Status
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Server: {status?.status} ({status?.responseTime})
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database: {status?.database?.connection?.state}
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2">Error: {error}</div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
