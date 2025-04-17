import { AuthForm } from "@/components/auth-form";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    if (token) {
      return redirect({ to: "/audio-upload" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div
        className="bg-card w-full max-w-md space-y-6 rounded-xl p-8 shadow-lg"
        style={{ marginBottom: "150px" }}
      >
        <h2 className="text-foreground text-center text-3xl font-bold">
          Log in to your account
        </h2>
        <AuthForm />
      </div>
    </div>
  );
}
