import React from "react";
import { Skeleton } from "../ui/skeleton";

export const HeaderLoader = ({
  title,
  canCreated = true,
}: {
  title: string;
  canCreated?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="leading-none font-semibold text-2xl">{title}</h1>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="size-8" />
        <Skeleton className="size-8" />
        {canCreated && <Skeleton className="h-8 w-32" />}
      </div>
    </div>
  );
};
