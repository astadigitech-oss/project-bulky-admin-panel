import { cn } from "@/lib/utils";
import { Loader2Icon, LucideIcon } from "lucide-react";

function Spinner({
  icon: Icon = Loader2Icon,
  className,
  ...props
}: React.ComponentProps<"svg"> & { icon?: LucideIcon }) {
  return (
    <Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
