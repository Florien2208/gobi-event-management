import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

async function AdminPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role == "admin") {
    redirect("/dashboard");
  }

  return <div>Admin Dashboard Content</div>;
}

export default AdminPage;