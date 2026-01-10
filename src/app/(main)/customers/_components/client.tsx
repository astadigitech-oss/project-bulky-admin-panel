"use client";

import { RefreshCw, Users2 } from "lucide-react";
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
import { useDeleteBuyer, useGetBuyerList, useGetBuyerStat } from "../_api";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { useEffect } from "react";
import { StatisticSection } from "./_section/stat";
import { ChartBuyer } from "./_section/chart";

export const CustomersClient = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created_at"),
    order: parseAsString.withDefault("desc"),
  });

  const [DialogDelete, confirmDelete] = useConfirm(
    "Delete [user]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const { mutate: deleteBuyer, isPending: isDeleting } = useDeleteBuyer();

  const { search, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();
  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetBuyerList({
    page,
    per_page: limit,
    search,
    sort_by: sort,
    order: order as "asc" | "desc",
  });
  const { data: stat } = useGetBuyerStat();

  const buyerList = list?.data ?? [];
  const statData = stat?.data;

  const isDisabled = isDeleting || isLoadList;

  const handleDelete = async (user: string, userId: string) => {
    const ok = await confirmDelete(user, "user");
    if (!ok) return;
    deleteBuyer({ params: { id: userId } });
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
      <DialogDelete />
      <h1 className="leading-none font-semibold text-2xl">Pelanggan</h1>
      <div className="grid grid-cols-8 grid-rows-2 gap-4">
        <ChartBuyer />
        <StatisticSection
          isMain
          icon={Users2}
          label="Pelanggan"
          description="Total Pelanggan Keseluruhan"
          value={statData?.total_buyer ?? 0}
          iconWrapStyle="bg-violet-500/10 border-violet-500/20"
          iconStyle="text-violet-600 dark:text-violet-400"
        />
        <StatisticSection
          icon={Users2}
          label="Pelanggan"
          description="Dalam Setahun"
          percent={statData?.persentase_tahun_ini.value ?? 0}
          status={statData?.persentase_tahun_ini.trend}
          value={statData?.persentase_tahun_ini.current ?? 0}
          iconWrapStyle="bg-violet-500/10 border-violet-500/20"
          iconStyle="text-violet-600 dark:text-violet-400"
        />
        <StatisticSection
          icon={Users2}
          label="Pelanggan"
          description="Dalam Sebulan"
          percent={statData?.persentase_bulan_ini.value ?? 0}
          status={statData?.persentase_bulan_ini.trend}
          value={statData?.persentase_bulan_ini.current ?? 0}
          iconWrapStyle="bg-violet-500/10 border-violet-500/20"
          iconStyle="text-violet-600 dark:text-violet-400"
        />
      </div>
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
            <Button
              variant={"outline"}
              size={"icon"}
              disabled={isDisabled || isRefetching}
              onClick={() => refetch()}
            >
              <RefreshCw
                className={cn("size-3.5", isRefetching && "animate-spin")}
              />
            </Button>
          }
        />
        <SortTable
          disabled={isDisabled}
          data={[]}
          order={order}
          sort={sort}
          setSort={setQuery}
        />
      </div>
      <div className="flex flex-col gap-4">
        <DataTable
          columns={column({ handleDelete, metaPage, isDisabled })}
          data={buyerList}
          isInitialLoading={isLoadList}
        />
        <Pagination
          pagination={{ ...metaPage, current_page: page, per_page: limit }}
          setPage={setPage}
          setLimit={setLimit}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
