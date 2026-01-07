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
import { useMe } from "./_api";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

const ToggleTheme = dynamic(() => import("../toggle-theme"), {
  ssr: false,
  loading: () => <Skeleton className="size-8 rounded-full" />,
});

export const Action = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isPending, isSuccess, isError } = useMe();
  const user = data?.data;

  useEffect(() => {
    if ((!user && isSuccess) || isError) {
      if (isError) toast.warning("Kredential kadaluarsa");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, pathname, router, isSuccess, isError]);

  return (
    <div className="ml-auto px-4 flex items-center gap-3">
      <ToggleTheme />
      <Sheet>
        <SheetTrigger
          disabled={isPending}
          render={
            <Button size={"icon"} variant={"outline"} className="rounded-full">
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
          disabled={isPending}
          render={
            <Button className="rounded-full" variant={"outline"}>
              <UserCircle />
              <span className="text-xs mr-2 capitalize">{user?.nama}</span>
              <ChevronDown />
            </Button>
          }
        />
        <DropdownMenuContent
          className={"w-auto"}
          align="end"
          sideOffset={19}
          alignOffset={5}
        >
          <DropdownMenuGroup>
            <Item className="flex items-center flex-nowrap px-2 py-1.5">
              <Avatar>
                <AvatarFallback>
                  {user?.nama
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Item className="flex flex-col gap-px text-sm items-start p-0">
                <p className="font-semibold">{user?.nama}</p>
                <p className="text-xs font-light">{user?.email}</p>
              </Item>
            </Item>
            <DropdownMenuSeparator />
            <Item className="flex items-center px-2 py-1.5 text-xs gap-2 bg-linear-to-l from-yellow-200 to-yellow-100  dark:from-yellow-200/50 dark:to-yellow-100/10 border-none">
              <UserCog className="size-3" />
              {user?.role.nama}
            </Item>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={"text-xs"} variant="destructive">
              <LogOut className="size-3" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
