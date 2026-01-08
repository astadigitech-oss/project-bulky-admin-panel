"use client";

import { Check, Plus, PlusCircle, RefreshCcw, XCircle } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { SortTable } from "@/components/sort-table";
import { parseAsString, useQueryStates } from "nuqs";
import { Button, buttonVariants } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { column } from "./columns";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import {
  useChangeStatusStaff,
  useDeleteStaff,
  useGetStaffDetail,
  useGetStaffList,
} from "../_api";
import { useEffect, useState } from "react";
import { DialogFormStaff } from "./_dialog/form";
import { useConfirm } from "@/hooks/use-confirm";
import { VariantProps } from "class-variance-authority";

export const StaffSettingsClient = () => {
  const [open, setOpen] = useState<"edit" | "create" | "password" | null>(null);
  const [{ sort, order, adminId }, setQuery] = useQueryStates(
    {
      adminId: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("created_at"),
      order: parseAsString.withDefault("desc"),
    },
    { urlKeys: { adminId: "id" } },
  );

  const [DialogDelete, confirmDelete] = useConfirm(
    "Delete [user]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const [DialogStatus, confirmStatus] = useConfirm(
    "[command]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );

  const { mutate: deleteStaff, isPending: isDeleting } = useDeleteStaff();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useChangeStatusStaff();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();
  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetStaffList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
  });
  const { data: detail } = useGetStaffDetail({
    id: adminId,
  });

  const staffList = list?.data ?? [];
  const isDisabled = isDeleting || isUpdatingStatus;
  console.log(isDeleting || isUpdatingStatus, isDeleting, isUpdatingStatus);

  const handleDelete = async (user: string, userId: string) => {
    const ok = await confirmDelete(user, "user");
    if (!ok) return;
    deleteStaff({ params: { id: userId } });
  };

  const handleChangeStatus = async (
    command: string,
    userId: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => {
    const ok = await confirmStatus(command, "command", variant);
    if (!ok) return;
    updateStatus({ params: { id: userId } });
  };

  useEffect(() => {
    if (list) {
      if (page > list.meta.last_page) {
        setPage(list.meta.last_page);
        return;
      }
      setPaginationData(list.meta);
    }
  }, [list]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogStatus />
      <DialogDelete />
      <DialogFormStaff
        open={!!open}
        onOpenChange={(e) => {
          if (!e) {
            setOpen(null);
            if (adminId) setQuery({ adminId: "" });
          }
        }}
        mode={open}
        detail={detail?.data}
      />
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Staff {open}</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari staff..."
            classNameWrap="w-60"
            value={search}
            setValue={setSearch}
          />
          <TooltipText
            value="Perbarui Data"
            render={
              <Button
                variant={"outline"}
                size={"icon"}
                disabled={isDisabled}
                onClick={() => refetch()}
              >
                <RefreshCcw
                  className={cn("size-3.5", isRefetching && "animate-spin")}
                />
              </Button>
            }
          />
          <SortTable
            data={[
              { name: "Nama", value: "name" },
              { name: "Email", value: "email" },
              { name: "Status", value: "status" },
              { name: "Diperbarui", value: "updatedAt" },
            ]}
            order={order}
            sort={sort}
            setSort={setQuery}
            disabled={isDisabled}
          />
          <Button
            className={"text-xs"}
            onClick={() => setOpen("create")}
            disabled={isDisabled}
          >
            <Plus className="size-3.5" />
            Tambah Staff
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger
              render={
                <button className="flex items-center border border-gray-300 dark:border-gray-300/50 border-dashed rounded-md h-8 hover:bg-yellow-200 dark:hover:bg-yellow-300/30 transition cursor-default group">
                  <div className="text-xs font-medium h-full py-0 px-3 flex items-center gap-2">
                    <PlusCircle className="size-3" />
                    Status
                  </div>
                  <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-full dark:bg-gray-500/50"
                  />
                  <div
                    className={cn(
                      "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 flex items-center justify-center",
                      "bg-yellow-200 dark:bg-yellow-300/30 dark:group-hover:bg-transparent",
                    )}
                  >
                    3
                  </div>
                </button>
              }
            />
            <PopoverContent
              portal={{ keepMounted: true }}
              className="p-0 w-32"
              align="start"
            >
              <Command className="p-0">
                <CommandGroup>
                  <CommandItem className="text-xs">
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      <Check className="text-primary-foreground size-3" />
                    </div>
                    Fulan
                  </CommandItem>
                  <CommandItem className="text-xs">
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-500/50 opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="text-primary-foreground size-3" />
                    </div>
                    haha
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem className="text-xs font-medium justify-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger
              render={
                <button className="flex items-center border border-gray-300 dark:border-gray-300/50 border-dashed rounded-md h-8 hover:bg-yellow-200 dark:hover:bg-yellow-300/30 transition cursor-default group">
                  <div className="text-xs font-medium h-full py-0 px-3 flex items-center gap-2">
                    <PlusCircle className="size-3" />
                    Role
                  </div>
                  <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-full dark:bg-gray-500/50"
                  />
                  <div
                    className={cn(
                      "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 flex items-center justify-center",
                      "bg-yellow-200 dark:bg-yellow-300/30 dark:group-hover:bg-transparent",
                    )}
                  >
                    3
                  </div>
                </button>
              }
            />
            <PopoverContent
              portal={{ keepMounted: true }}
              className="p-0 w-32"
              align="start"
            >
              <Command className="p-0">
                <CommandGroup>
                  <CommandItem className="text-xs">
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      <Check className="text-primary-foreground size-3" />
                    </div>
                    Fulan
                  </CommandItem>
                  <CommandItem className="text-xs">
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-500/50 opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="text-primary-foreground size-3" />
                    </div>
                    haha
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem className="text-xs font-medium justify-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            className="text-xs font-normal h-8 py-0 px-3"
            variant={"ghost"}
          >
            Reset
            <XCircle />
          </Button>
        </div>

        <DataTable
          columns={column({
            metaPage,
            setOpen,
            setQuery,
            handleDelete,
            handleChangeStatus,
            disabled: isDisabled,
          })}
          data={staffList}
          isInitialLoading={isLoadList}
        />
        <Pagination
          pagination={metaPage}
          setPage={setPage}
          setLimit={setLimit}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
