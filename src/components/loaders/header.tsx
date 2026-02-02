import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { ChevronRight, LucideIcon } from "lucide-react";

export const HeaderLoader = ({
  title,
  icon: Icon,
  isDetail = false,
  canCreated = true,
  justTitle = true,
  withTitle = true,
}: {
  icon?: LucideIcon;
  title?: string;
  isDetail?: boolean;
  canCreated?: boolean;
  justTitle?: boolean;
  withTitle?: boolean;
}) => {
  return (
    <div className="flex items-center w-full">
      {isDetail && Icon ? (
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size={"icon-lg"}>
            <Icon className="size-5" />
          </Button>
          <ChevronRight className="size-4" />
          <h1 className="leading-none font-semibold text-2xl">{title}</h1>
        </div>
      ) : (
        justTitle && (
          <h1 className="leading-none font-semibold text-2xl">{title}</h1>
        )
      )}
      {withTitle && (
        <div className="flex items-center gap-2 ml-auto">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
          {canCreated && <Skeleton className="h-8 w-32" />}
        </div>
      )}
    </div>
  );
};
