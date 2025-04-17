import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return redirect({ to: "/login" });
    }

    return redirect({ to: "/audio-upload" });
  },
});
