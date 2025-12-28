import {
  Tooltip,
  TooltipContent,
  TooltipPositioner,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

export const TooltipText = ({
  children,
  value,
  className,
  classTrigger,
  sideOffset,
  align,
  side,
  delay,
}: {
  className?: string;
  classTrigger?: string;
  sideOffset?: number;
  children: ReactNode;
  align?: "center" | "end" | "start";
  side?: "top" | "bottom" | "left" | "right";
  value: ReactNode;
  delay?: number;
}) => {
  return (
    <TooltipProvider delay={delay}>
      <Tooltip>
        <TooltipTrigger className={classTrigger}>{children}</TooltipTrigger>
        <TooltipPositioner align={align} side={side} sideOffset={sideOffset}>
          <TooltipContent className={className}>{value}</TooltipContent>
        </TooltipPositioner>
      </Tooltip>
    </TooltipProvider>
  );
};
