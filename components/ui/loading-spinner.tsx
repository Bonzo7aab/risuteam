import { cn } from "@/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export const LoadingSpinner = ({
  className,
  size = 24,
}: LoadingSpinnerProps) => {
  return (
    <Loader2
      className={cn("animate-spin text-risu-400", className)}
      size={size}
    />
  );
};
