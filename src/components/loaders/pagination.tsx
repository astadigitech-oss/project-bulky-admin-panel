import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";

export const PaginationLoader = () => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-16" />
        <Separator orientation="vertical" className={"h-4!"} />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="size-8" />
        <Skeleton className="size-8" />
        <div className="w-32 flex justify-center">
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="size-8" />
        <Skeleton className="size-8" />
      </div>
    </div>
  );
};
