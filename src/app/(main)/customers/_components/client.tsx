"use client";

import { RefreshCcw } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { SortTable } from "@/components/sort-table";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { column } from "./columns";
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";

export const CustomersClient = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created"),
    order: parseAsString.withDefault("desc"),
  });
  const { search, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit } = usePagination();
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Pelanggan</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari pengguna..."
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
              { name: "Name", value: "name" },
              { name: "Username", value: "username" },
              { name: "Email", value: "email" },
              { name: "Diperbarui", value: "updatedAt" },
            ]}
            order={order}
            sort={sort}
            setSort={setQuery}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <DataTable
          columns={column}
          data={[
            {
              name: "Ahman",
              email: "ahman@example.com",
              username: "ahman",
              createdAt: new Date("2025-12-30T07:00:00"),
              updatedAt: new Date("2025-12-30T07:00:00"),
            },
            {
              name: "Fulan",
              email: "fulan@example.com",
              username: "fulan",
              createdAt: new Date("2025-12-30T07:00:00"),
              updatedAt: new Date("2025-12-30T07:00:00"),
            },
          ]}
        />
        <Pagination
          pagination={{ ...metaPage, current_page: page, per_page: limit }}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
};
