import type { LinkOptions } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import { FileAudio, FileText, LogOut, Mic } from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  to: LinkOptions["to"];
}

const menuItems: MenuItem[] = [
  { icon: Mic, label: "Audio Upload", to: "/audio-upload" },
  { icon: FileAudio, label: "Audio Recordings", to: "/audio-recordings" },
  { icon: FileText, label: "Prompt Management", to: "/prompt-management" },
];

interface AppSidebarProps {
  children?: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen">
      <div
        className={cn(
          "fixed top-0 left-0 z-40 flex h-full flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16",
        )}
      >
        <Button
          variant="ghost"
          className="absolute top-4 -right-4 z-50 h-8 w-8 rounded-full bg-gray-800 p-0 hover:bg-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "<" : ">"}
        </Button>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center">
            <div className="rounded-full bg-white p-2">
              <Mic className="h-8 w-8 text-gray-900" />
            </div>
          </div>
          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center rounded-lg p-2 transition-colors hover:bg-gray-800"
                activeProps={{ className: "bg-gray-800" }}
              >
                <item.icon className="h-5 w-5" />
                {isOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {isOpen && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 p-6 transition-all duration-300 ease-in-out",
          isOpen ? "ml-64" : "ml-16",
        )}
      >
        {children}
      </div>
    </div>
  );
}
