"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useState } from "react";

export function NavMain({
  items,
}: Readonly<{
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    items: {
      title: string;
      url: string;
    }[];
  }[];
}>) {
  const pathname = usePathname();

  const [openKey, setOpenKey] = useState<string | null>(() => {
    const active = items.find((item) =>
      item.items?.some((i) => pathname.includes(i.url)),
    );
    return active?.title ?? null;
  });

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.url !== "/" && pathname.includes(item.url);

          if (item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              open={openKey === item.title}
              onOpenChange={(open) => setOpenKey(open ? item.title : null)}
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() =>
                    setOpenKey(openKey === item.title ? null : item.title)
                  }
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>

                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="data-[state=open]:rotate-90">
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.includes(subItem.url)}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
