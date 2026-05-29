"use client";

import { InputSearch } from "@/components/ui/input-search";
import { useSearchQuery } from "@/hooks/use-search";
import { parseAsString, useQueryStates } from "nuqs";
import { SortTable } from "@/components/sort-table";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "@/components/ui/data-table";
import { column } from "./columns";
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useEffect } from "react";
import { useGetActivityLogList } from "../_api";

export const ActivityLogClient = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created_at"),
    order: parseAsString.withDefault("desc"),
  });

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();

  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetActivityLogList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
  });

  const activityList = list?.data ?? [];

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
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Log Aktivitas</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari log aktivitas..."
            classNameWrap="w-60"
            value={search}
            setValue={setSearch}
          />
          <TooltipText
            value="Perbarui Data"
            render={
              <Button variant={"outline"} size={"icon"} onClick={() => refetch()}>
                <RefreshCw
                  className={cn("size-3.5", isRefetching && "animate-spin")}
                />
              </Button>
            }
          />
          <SortTable data={[]} order={order} sort={sort} setSort={setQuery} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DataTable
          columns={column({ metaPage })}
          data={activityList}
          isInitialLoading={isLoadList}
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
