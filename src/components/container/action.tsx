"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Bell, ChevronDown, LogOut, UserCircle, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Item } from "../ui/item";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

const ToggleTheme = dynamic(() => import("../toggle-theme"), {
  ssr: false,
  loading: () => <Skeleton className="size-8 rounded-full" />,
});

export const Action = () => {
  return (
    <div className="ml-auto px-4 flex items-center gap-3">
      <ToggleTheme />
      <Sheet>
        <SheetTrigger
          render={
            <Button
              size={"icon"}
              variant={"outline"}
              className="rounded-full shadow-sm"
            >
              <Bell />
              <span className="sr-only">Toggle Notification</span>
            </Button>
          }
        />
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Pemberitahuan</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button className="rounded-full shadow-sm" variant={"outline"}>
              <UserCircle />
              <span className="text-xs mr-2">Ahmad Fulan</span>
              <ChevronDown />
            </Button>
          }
        />
        <DropdownMenuPositioner align="end" sideOffset={19} alignOffset={5}>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <Item className="flex items-center px-2 py-1.5">
                <Avatar>
                  <AvatarFallback>
                    {"Ahmad Fulan"
                      .split(" ")
                      .map((word) => word[0].toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Item className="flex flex-col gap-px text-sm items-start p-0">
                  <p className="font-semibold">Ahamd Fulan</p>
                  <p className="text-xs font-light">ahmad.fulan@mail.com</p>
                </Item>
              </Item>
              <DropdownMenuSeparator />
              <Item className="flex items-center px-2 py-1.5 text-xs gap-2 bg-linear-to-l from-yellow-200 to-yellow-100  dark:from-yellow-200/50 dark:to-yellow-100/10 border-none">
                <UserCog className="size-3" />
                Admin
              </Item>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={
                  "text-xs text-red-500 focus:text-red-500 dark:text-red-400 dark:focus:text-red-400 focus:bg-red-500/20"
                }
              >
                <LogOut className="size-3 text-red-500 hover:text-red-500 dark:text-red-400 dark:focus:text-red-400" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenuPositioner>
      </DropdownMenu>
    </div>
  );
};
