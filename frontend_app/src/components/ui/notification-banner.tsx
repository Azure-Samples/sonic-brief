import { useEffect, useState } from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const notificationVariants = cva(
  "fixed top-4 left-1/2 flex w-full max-w-sm -translate-x-1/2 transform items-center justify-between rounded-lg p-4 text-white shadow-lg",
  {
    variants: {
      variant: {
        success: "bg-green-500",
        error: "bg-red-500",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  },
);

export interface NotificationBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  message: string;
  onClose?: () => void;
  autoHideDuration?: number;
}

export function NotificationBanner({
  className,
  variant,
  message,
  onClose,
  autoHideDuration = 5000,
  ...props
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [autoHideDuration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(notificationVariants({ variant }), className)}
      {...props}
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="ml-4 rounded-full p-1 transition-colors hover:bg-white/20"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
