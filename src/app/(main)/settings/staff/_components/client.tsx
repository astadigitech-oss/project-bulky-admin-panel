"use client";

import { Check, PlusCircle, RefreshCcw, XCircle } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { SortTable } from "@/components/sort-table";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
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

export const StaffSettingsClient = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created"),
    order: parseAsString.withDefault("desc"),
  });
  const { search, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit } = usePagination();
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Staff</h1>
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
              <Button variant={"outline"} size={"icon"}>
                <RefreshCcw />
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
          />
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
          columns={column}
          data={[
            {
              name: "Ahman",
              email: "ahman@example.com",
              role: "Super Admin",
              isActive: true,
              createdAt: new Date("2025-12-30T07:00:00"),
              updatedAt: new Date("2025-12-30T07:00:00"),
            },
            {
              name: "Fulan",
              email: "fulan@example.com",
              role: "Supervisor",
              isActive: false,
              createdAt: new Date("2025-12-30T07:00:00"),
              updatedAt: new Date("2025-12-30T07:00:00"),
            },
          ]}
        />
        <Pagination
          pagination={{ ...metaPage, current: page, limit }}
          setPagination={setPage}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
};
