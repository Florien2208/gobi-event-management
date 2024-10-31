// app/admin/layout.js
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
console.log("layout session",session.user)
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div>
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
      </nav>

      <main className="container mx-auto">{children}</main>
    </div>
  );
}
