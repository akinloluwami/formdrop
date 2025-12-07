import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { AdminSidebar } from "@/components/admin-sidebar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") {
      return;
    }
    const { data: session, error } = await authClient.getSession();
    console.log("Admin Route Session Check:", session);
    if (error) {
      console.error("Admin Route Session Error:", error);
    }
    if (!session) {
      console.log("No session, redirecting to login");
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
    console.log("User Role:", session.user.role);
    if (session.user.role !== "admin") {
      console.log("User is not admin, redirecting to home");
      throw redirect({
        to: "/",
      });
    }
  },
});

function AdminLayout() {
  return (
    <div className="p-2 bg-gray-100 h-screen gap-2 flex">
      <AdminSidebar />
      <div className="bg-white rounded-2xl border border-gray-200 w-full py-5 px-20 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
