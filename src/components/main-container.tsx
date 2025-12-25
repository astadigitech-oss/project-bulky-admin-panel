"use client";

import React, { Fragment } from "react";
import { SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "./ui/skeleton";

const ToggleTheme = dynamic(() => import("./toggle-theme"), {
  ssr: false,
  loading: () => <Skeleton className="size-8 rounded-full" />,
});

export const MainContainer = ({
  breadcrumbs,
  children,
}: {
  breadcrumbs?: { label: string; url?: string }[];
  children: React.ReactNode;
}) => {
  return (
    <SidebarInset className="relative overflow-y-scroll h-[calc(100vh-16px-16px)]">
      <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
              <Separator
                orientation="vertical"
                className="mr-1 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                {breadcrumbs.length === 1 && (
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>{breadcrumbs[0].label}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                )}
                {breadcrumbs.length >= 2 && (
                  <BreadcrumbList>
                    {breadcrumbs
                      .slice(0, breadcrumbs.length - 1)
                      .map((breadcrumb) => (
                        <Fragment key={breadcrumb.label}>
                          <BreadcrumbItem>
                            {breadcrumb.url ? (
                              <BreadcrumbLink href={breadcrumb.url}>
                                {breadcrumb.label}
                              </BreadcrumbLink>
                            ) : (
                              breadcrumb.label
                            )}
                          </BreadcrumbItem>
                          <BreadcrumbSeparator />
                        </Fragment>
                      ))}
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {breadcrumbs[breadcrumbs.length - 1].label}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                )}
              </Breadcrumb>
            </>
          )}
        </div>
        <div className="ml-auto px-4 flex items-center gap-3">
          <ToggleTheme />
          <Button
            size={"icon"}
            variant={"outline"}
            className="rounded-full shadow-sm"
          >
            <Bell />
          </Button>
        </div>
      </header>
      <ScrollArea>
        <div className="px-4 pb-4">{children}</div>
      </ScrollArea>
    </SidebarInset>
  );
};
