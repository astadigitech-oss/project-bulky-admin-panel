"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
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

interface NavValueProps {
  title: string;
  url: string;
  icon: LucideIcon;
  items: {
    title: string;
    url: string;
  }[];
}

export function NavMain({
  nav,
}: Readonly<{
  nav: {
    navMain: NavValueProps[];
    navInfo: NavValueProps[];
    navPreferences: NavValueProps[];
  };
}>) {
  const pathname = usePathname();

  const [openKey, setOpenKey] = useState<string | null>(() => {
    const allNavs = [...nav.navMain, ...nav.navInfo, ...nav.navPreferences];

    const active = allNavs.find((item) =>
      item.items?.some((subItem) => pathname.includes(subItem.url)),
    );

    return active ? active.title : null;
  });

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          {nav.navMain.map((item) => {
            const isActive = item.url !== "/" && pathname.includes(item.url);

            if (item.items.length === 0) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    render={
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                key={item.title}
                open={openKey === item.title}
                onOpenChange={(open) => setOpenKey(open ? item.title : null)}
                render={
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

                    <CollapsibleTrigger
                      render={
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      }
                    />

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={pathname.includes(subItem.url)}
                              render={
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                }
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Suber Daya</SidebarGroupLabel>
        <SidebarMenu>
          {nav.navInfo.map((item) => {
            const isActive = item.url !== "/" && pathname.includes(item.url);

            if (item.items.length === 0) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    render={
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                key={item.title}
                open={openKey === item.title}
                onOpenChange={(open) => setOpenKey(open ? item.title : null)}
                render={
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

                    <CollapsibleTrigger
                      render={
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      }
                    />

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={pathname.includes(subItem.url)}
                              render={
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                }
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Preferensi</SidebarGroupLabel>
        <SidebarMenu>
          {nav.navPreferences.map((item) => {
            const isActive = item.url !== "/" && pathname.includes(item.url);

            if (item.items.length === 0) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    render={
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                key={item.title}
                open={openKey === item.title}
                onOpenChange={(open) => setOpenKey(open ? item.title : null)}
                render={
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

                    <CollapsibleTrigger
                      render={
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      }
                    />

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={pathname.includes(subItem.url)}
                              render={
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                }
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
