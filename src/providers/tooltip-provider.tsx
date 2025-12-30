import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactElement, ReactNode } from "react";

export const TooltipText = ({
  value,
  className,
  classTrigger,
  sideOffset,
  align,
  side,
  delay,
  render,
}: {
  className?: string;
  classTrigger?: string;
  sideOffset?: number;
  align?: "center" | "end" | "start";
  side?: "top" | "bottom" | "left" | "right";
  value: ReactNode;
  delay?: number;
  render?: ReactElement;
}) => {
  return (
    <TooltipProvider delay={delay}>
      <Tooltip>
        <TooltipTrigger className={classTrigger} render={render} />
        <TooltipContent
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={className}
        >
          {value}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
