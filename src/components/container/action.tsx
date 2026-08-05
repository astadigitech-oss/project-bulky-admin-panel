"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Bell, LogOut, UserCircle, UserCog } from "lucide-react";
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
import { useLogout, useMe } from "./_api";
import { MouseEvent, useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cookiesKey } from "@/config";
import { useMounted } from "@/hooks/use-mounted";
import { deleteCookie } from "cookies-next/client";
import { Dialog, DialogContent } from "../ui/dialog";
import { Spinner } from "../ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover";

const ToggleTheme = dynamic(() => import("../toggle-theme"), {
  ssr: false,
  loading: () => <Skeleton className="size-8 rounded-full" />,
});

export const Action = () => {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const [isTransition, startTransition] = useTransition();
  const { data, isPending: isMePending, isSuccess, isError } = useMe();
  const { mutate: logout, isPending: isLogouting } = useLogout();
  const user = data?.data;
  const isLoading = !mounted || isLogouting || isMePending || isTransition;

  const handleLogout = (e: MouseEvent) => {
    e.preventDefault();
    logout(
      {},
      {
        onSuccess: () => {
          deleteCookie(cookiesKey);
          startTransition(() => {
            router.push("/login");
          });
        },
      },
    );
  };

  useEffect(() => {
    if ((!user && isSuccess) || isError) {
      if (isError) toast.warning("Kredential kadaluarsa");
      router.push(`/login?redirect=${encodeURIComponent(pathname.slice(1))}`);
    }
  }, [user, pathname, router, isSuccess, isError]);

  return (
    <div className="ml-auto px-4 flex items-center gap-2">
      <Dialog open={isTransition}>
        <DialogContent
          showCloseButton={false}
          className={
            "bg-transparent border-none shadow-none ring-0 outline-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
          }
        >
          <Spinner className="size-7" />
          <p className="text-center text-sm">
            Mohon tunggu, Anda akan dialihkan ke halaman login.
          </p>
        </DialogContent>
      </Dialog>
      <ToggleTheme />
      <Popover>
        <PopoverTrigger
          disabled={isLoading}
          render={
            <Button size={"icon"} variant={"outline"} className="rounded-full">
              {isLoading ? <Spinner /> : <Bell />}
              <span className="sr-only">Toggle Notification</span>
            </Button>
          }
        />
        <PopoverContent
          sideOffset={27}
          align="end"
          alignOffset={-45}
          className={"w-auto min-w-75 h-[calc(100vh-16px-16px-86px)]"}
        >
          <PopoverHeader>
            <PopoverTitle>Pemberitahuan</PopoverTitle>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isLoading}
          render={
            <Button className="rounded-full" variant={"outline"} size={"icon"}>
              {isLoading ? <Spinner /> : <UserCircle />}
            </Button>
          }
        />
        <DropdownMenuContent
          className={"w-auto"}
          align="end"
          sideOffset={27}
          alignOffset={-5}
        >
          <DropdownMenuGroup>
            <Item className="flex items-center flex-nowrap px-2 py-1.5">
              <Avatar>
                <AvatarFallback className={"bg-yellow-300 text-yellow-900"}>
                  {user?.nama
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Item className="flex flex-col gap-px text-sm items-start p-0">
                <p className="font-semibold text-yellow-900 leading-tight dark:text-yellow-50">
                  {user?.nama}
                </p>
                <p className="text-xs font-light leading-tight text-gray-600 dark:text-gray-300">
                  {user?.email}
                </p>
              </Item>
            </Item>
            <DropdownMenuSeparator />
            <Item className="flex items-center px-2 py-1.5 text-xs gap-2 bg-linear-to-l from-yellow-200 to-yellow-100  dark:from-yellow-200/50 dark:to-yellow-100/10 border-none">
              <UserCog className="size-3" />
              {user?.role.nama}
            </Item>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className={"text-xs"}
              variant="destructive"
            >
              <LogOut className="size-3" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
