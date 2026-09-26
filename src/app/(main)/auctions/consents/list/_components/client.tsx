"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import { InputSearch } from "@/components/ui/input-search";
import Pagination from "@/components/pagination";
import { TooltipText } from "@/providers/tooltip-provider";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchQuery } from "@/hooks/use-search";
import { useGetPersetujuanSyaratLelangList } from "@/app/(main)/auctions/consents/_api";
import { createColumns } from "./columns";

export function PersetujuanSyaratLelangListClient() {
  const router = useRouter();
  const { search, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } = usePagination("p", "limit");
  const { data, refetch, isRefetching, isLoading } = useGetPersetujuanSyaratLelangList({
    page: page ?? 1,
    per_page: limit ?? 10,
    search: search || undefined,
    enabled: page !== null && limit !== null,
  });
  const items = data?.data ?? [];

  useEffect(() => {
    if (!data) return;
    if (page > data.meta.last_page) {
      setPage(data.meta.last_page);
      return;
    }
    setPaginationData(data.meta);
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl leading-none font-semibold">Persetujuan SK Lelang</h1>
      <div className="flex items-center justify-between gap-3">
        <InputSearch
          value={search}
          setValue={setSearch}
          placeholder="Cari pembeli, batch, atau bid..."
          className="max-w-sm"
        />
        <TooltipText
          value="Refresh data"
          render={
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={isRefetching ? "animate-spin" : ""} />
            </Button>
          }
        />
      </div>
      <DataTable
        columns={createColumns({ onDetail: (id) => router.push(`/auctions/consents/list/${id}`) })}
        data={items}
        isInitialLoading={isLoading}
      />
      <Pagination pagination={metaPage} setPage={setPage} setLimit={setLimit} />
    </div>
  );
}
