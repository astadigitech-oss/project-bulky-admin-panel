import { Card } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LucideIcon, Minus, TrendingDown, TrendingUp } from "lucide-react";

export const StatisticSection = ({
  isMain = false,
  status,
  percent = 0,
  value,
  label,
  description,
  icon: Icon,
  iconStyle,
  iconWrapStyle,
}: {
  isMain?: boolean;
  status?: "up" | "down" | "stable";
  percent?: number;
  value: number;
  label: string;
  description: string;
  icon: LucideIcon;
  /**
   * @example "bg-violet-500/10 border-violet-500/20"
   */
  iconWrapStyle: string;
  /**
   * @example "text-violet-600 dark:text-violet-400"
   */
  iconStyle: string;
}) => {
  const { open: openSidebar } = useSidebar();
  return (
    <Card
      className={cn(
        "size-full p-4 flex flex-col justify-between overflow-hidden bg-card",
        isMain
          ? openSidebar
            ? "2xl:col-span-2 col-span-4"
            : "xl:col-span-2 col-span-4"
          : openSidebar
            ? "2xl:col-span-1 col-span-2"
            : "xl:col-span-1 col-span-2",
      )}
    >
      {/* Header dengan icon dan trend */}
      <div className="flex items-center justify-between relative">
        <div
          className={cn(
            "flex size-7 items-center justify-center rounded-lg border",
            iconWrapStyle,
          )}
        >
          <Icon className={cn("size-3.5", iconStyle)} />
        </div>

        {!isMain && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md border",
              status === "up" && "bg-emerald-500/10 border-emerald-500/20",
              status === "down" && "bg-red-500/10 border-red-500/20",
              status === "stable" && "bg-gray-500/10 border-gray-500/20",
            )}
          >
            {status === "up" && (
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            )}
            {status === "down" && (
              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
            {status === "stable" && (
              <Minus className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            )}
            <span
              className={cn(
                "text-xs font-bold",
                status === "up" && "text-emerald-600 dark:text-emerald-400",
                status === "down" && "text-red-600 dark:text-red-400",
                status === "stable" && "text-gray-600 dark:text-gray-400",
              )}
            >
              {Math.abs(percent)}%
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="relative">
        <p className="text-3xl font-bold leading-none mb-1 text-zinc-900 dark:text-white">
          {value.toLocaleString("id-ID")}
        </p>
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </p>
        <p className="text-[10px] text-zinc-600 dark:text-zinc-500">
          {description}
        </p>
      </div>
    </Card>
  );
};
