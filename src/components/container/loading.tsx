import React from "react";
import { SidebarInset } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";

export const LoadingContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SidebarInset className="relative overflow-y-scroll h-[calc(100vh-16px-16px)]">
      <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2 px-4">
          <Skeleton className="size-7 rounded-md" />
        </div>
        <div className="ml-auto flex items-center gap-3 px-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="w-32 h-8 rounded-full" />
        </div>
      </header>
      <div className="px-4 pb-4">{children}</div>
    </SidebarInset>
  );
};
