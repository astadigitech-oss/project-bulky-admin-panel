"use client";

import { RefreshCw } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { createColumns } from "./columns";
import { useGetDisclaimerConsentList } from "@/app/(main)/orders/disclaimer-consent/_api";
import { usePagination } from "@/hooks/use-pagination";
import Pagination from "@/components/pagination";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const DisclaimerConsentListClient = () => {
  const router = useRouter();
  const { search, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination("p", "limit");

  const {
    data: listData,
    refetch,
    isRefetching,
    isLoading,
  } = useGetDisclaimerConsentList({
    page: page ?? 1,
    per_page: limit ?? 10,
    search: search || undefined,
    enabled: page !== null && limit !== null,
  });

  const items = listData?.data ?? [];

  const columns = createColumns({
    onDetail: (pesananId) =>
      router.push(`/orders/disclaimer-consent/list/${pesananId}`),
  });

  useEffect(() => {
    if (listData) {
      if (page > listData.meta.last_page) {
        setPage(listData.meta.last_page);
        return;
      }
      setPaginationData(listData.meta);
    }
  }, [listData]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="leading-none font-semibold text-2xl">
        Persetujuan Disclaimer
      </h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <InputSearch
          value={search}
          setValue={setSearch}
          placeholder="Cari pesanan atau pembeli..."
          className="max-w-sm"
        />
        <TooltipText
          value="Refresh data"
          render={
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={isRefetching ? "animate-spin" : ""} />
            </Button>
          }
        />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={items} isInitialLoading={isLoading} />

      {/* Pagination */}
      <Pagination
        pagination={metaPage}
        setPage={setPage}
        setLimit={setLimit}
      />
    </div>
  );
};
