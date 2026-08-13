"use client";

import { CloudDownload, LoaderCircle, MapPin, RefreshCw, Route } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useEffect, useState } from "react";
import {
  useGetForwarderCities,
  useGetForwarderSubdistricts,
  useSyncForwarderMapping,
} from "../_api";
import { SyncResult } from "../_api/types";
import { DialogSyncResult } from "./_dialog/sync-result";
import { columnCity, columnSubdistrict } from "./columns";

export const ForwarderMappingClient = () => {
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [tab, setTab] = useState<"city" | "subdistrict">("city");

  // Search per-tab (query param berbeda agar tidak bentrok)
  const {
    search: searchCity,
    searchValue: searchCityValue,
    setSearch: setSearchCity,
  } = useSearchQuery("cq");
  const {
    search: searchSub,
    searchValue: searchSubValue,
    setSearch: setSearchSub,
  } = useSearchQuery("sq");

  // Pagination per-tab (query param berbeda agar tidak bentrok)
  const cityPag = usePagination("cp", "climit");
  const subPag = usePagination("sp", "slimit");

  const [DialogSync, confirmSync] = useConfirm(
    "Sync Data Forwarder Mapping",
    "Master data kota & kecamatan akan ditarik dari API Forwarder dan memperbarui tabel mapping (upsert). Data ini dipakai untuk lookup alamat saat booking Forwarder. Lanjutkan?",
  );

  const { mutate: sync, isPending: isSyncing } = useSyncForwarderMapping();

  const {
    data: cityList,
    refetch: refetchCities,
    isRefetching: isRefetchingCities,
    isLoading: isLoadCities,
  } = useGetForwarderCities({
    page: cityPag.page,
    per_page: cityPag.limit,
    search: searchCityValue,
  });
  const {
    data: subList,
    refetch: refetchSubdistricts,
    isRefetching: isRefetchingSub,
    isLoading: isLoadSub,
  } = useGetForwarderSubdistricts({
    page: subPag.page,
    per_page: subPag.limit,
    search: searchSubValue,
  });

  const cities = cityList?.data ?? [];
  const subdistricts = subList?.data ?? [];
  const isDisabled = isSyncing;

  const handleSync = async () => {
    const ok = await confirmSync();
    if (!ok) return;
    sync(
      {},
      {
        onSuccess: ({ data }) => {
          setSyncResult(data.data);
          refetchCities();
          refetchSubdistricts();
        },
      },
    );
  };

  useEffect(() => {
    if (cityList) {
      if (cityPag.page > cityList.meta.last_page) {
        cityPag.setPage(cityList.meta.last_page);
        return;
      }
      cityPag.setPaginationData(cityList.meta);
    }
  }, [cityList]);

  useEffect(() => {
    if (subList) {
      if (subPag.page > subList.meta.last_page) {
        subPag.setPage(subList.meta.last_page);
        return;
      }
      subPag.setPaginationData(subList.meta);
    }
  }, [subList]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogSync />
      <DialogSyncResult
        open={!!syncResult}
        onOpenChange={(open) => {
          if (!open) setSyncResult(null);
        }}
        result={syncResult}
      />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="leading-none font-semibold text-2xl">
            Forwarder Mapping
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Master data mapping kota & kecamatan dari API Forwarder, dipakai
            untuk lookup alamat saat booking Forwarder. Tarik data terbaru
            melalui tombol{" "}
            <span className="font-medium text-foreground">Sync Data</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "city" | "subdistrict")}
          >
            <TabsList>
              <TabsTrigger value="city" className="gap-1.5">
                <MapPin className="size-3.5" />
                Kota
              </TabsTrigger>
              <TabsTrigger value="subdistrict" className="gap-1.5">
                <Route className="size-3.5" />
                Kecamatan
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <TooltipText
              value="Perbarui Data"
              render={
                <Button
                  variant={"outline"}
                  size={"icon"}
                  disabled={isDisabled}
                  onClick={() => {
                    refetchCities();
                    refetchSubdistricts();
                  }}
                >
                  <RefreshCw
                    className={cn(
                      "size-3.5",
                      (isRefetchingCities || isRefetchingSub) && "animate-spin",
                    )}
                  />
                </Button>
              }
            />
            <Button
              className={"text-xs"}
              onClick={handleSync}
              disabled={isDisabled}
            >
              {isSyncing ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <CloudDownload className="size-3.5" />
              )}
              {isSyncing ? "Menyinkronkan..." : "Sync Data"}
            </Button>
          </div>
        </div>
      </div>

      {/* Konten tab */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "city" | "subdistrict")}>
        <TabsContent value="city" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <InputSearch
              placeholder="Cari kota..."
              classNameWrap="w-60"
              value={searchCity}
              setValue={setSearchCity}
            />
          </div>
          <DataTable
            columns={columnCity({ metaPage: cityPag.metaPage })}
            data={cities}
            isInitialLoading={isLoadCities}
          />
          <Pagination
            pagination={{
              ...cityPag.metaPage,
              current_page: cityPag.page,
              per_page: cityPag.limit,
            }}
            setPage={cityPag.setPage}
            setLimit={cityPag.setLimit}
            disabled={isDisabled}
          />
        </TabsContent>
        <TabsContent value="subdistrict" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <InputSearch
              placeholder="Cari kecamatan..."
              classNameWrap="w-60"
              value={searchSub}
              setValue={setSearchSub}
            />
          </div>
          <DataTable
            columns={columnSubdistrict({ metaPage: subPag.metaPage })}
            data={subdistricts}
            isInitialLoading={isLoadSub}
          />
          <Pagination
            pagination={{
              ...subPag.metaPage,
              current_page: subPag.page,
              per_page: subPag.limit,
            }}
            setPage={subPag.setPage}
            setLimit={subPag.setLimit}
            disabled={isDisabled}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
