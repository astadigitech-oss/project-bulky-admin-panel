"use client";

import React, { Fragment } from "react";
import { SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Action } from "./action";

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
                className="mr-1 data-[orientation=vertical]:h-4 bg-gray-400"
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
                            <span className="sr-only">breadcrumb</span>
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
        <Action />
      </header>
      <ScrollArea>
        <div className="px-4 pb-4">{children}</div>
      </ScrollArea>
    </SidebarInset>
  );
};
