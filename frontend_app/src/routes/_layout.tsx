import { AppSidebar } from "@/components/app-sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <Outlet />
    </div>
  );
}
