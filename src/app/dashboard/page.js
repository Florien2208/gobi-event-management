// app/dashboard/page.js
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }
console.log("session",session.user)
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <div className="grid gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {session.user.name}
          </h2>
          <p>Email: {session.user.email}</p>
          <p>Role: {session.user.role}</p>
          {session.user.userFields && (
            <div>
              <p>
                Notifications:{" "}
                {session.user.userFields.preferences.notifications
                  ? "Enabled"
                  : "Disabled"}
              </p>
              <p>
                Newsletter:{" "}
                {session.user.userFields.preferences.newsletter
                  ? "Subscribed"
                  : "Not subscribed"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
