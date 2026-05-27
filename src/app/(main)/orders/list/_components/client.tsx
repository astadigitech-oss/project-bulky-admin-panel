"use client";

import {
  Download,
  PlusCircle,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Item } from "@/components/ui/item";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { SortTable } from "@/components/sort-table";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { createColumns } from "./columns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  useDeleteOrder,
  useGetOrderList,
  useGetOrderStatistics,
} from "@/app/(main)/orders/_api";
import { usePagination } from "@/hooks/use-pagination";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Menunggu Pembayaran" },
  { value: "PROCESSING", label: "Pengemasan" },
  { value: "READY", label: "Siap Kirim" },
  { value: "SHIPPED", label: "Pengiriman" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
] as const;

const chartConfig = {
  total: {
    label: "Pesanan",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const OrderListClient = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created_at"),
    order: parseAsString.withDefault("desc"),
  });

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Chart filter states
  const [filterType, setFilterType] = useState<"default" | "custom">("default");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const router = useRouter();
  const { search, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();

  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus Pesanan",
    "Apakah anda yakin ingin menghapus pesanan ini? Tindakan ini bersifat permanen.",
    "destructive",
  );

  const { mutate: deleteOrder } = useDeleteOrder();

  const {
    data: listData,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetOrderList({
    page: page ?? 1,
    per_page: limit ?? 10,
    search: search || undefined,
    sort_by: sort,
    order: order as "asc" | "desc",
    status: selectedStatuses.length === 1 ? selectedStatuses[0] : undefined,
    enabled: page !== null && limit !== null,
  });

  // Build query params based on filter type
  const buildChartParams = () => {
    const params: any = {};

    if (filterType === "custom") {
      if (dateRange?.from) {
        params.tanggal_dari = format(dateRange.from, "yyyy-MM-dd");
      }
      if (dateRange?.to) {
        params.tanggal_sampai = format(dateRange.to, "yyyy-MM-dd");
      }
    }
    // Default: tahun berjalan (BE akan handle otomatis)

    return params;
  };

  const { data: statsData, isLoading: isLoadingStats } =
    useGetOrderStatistics(buildChartParams());

  const orders = listData?.data ?? [];
  const stats = statsData?.data;
  const chartData = stats?.chart_data ?? [];

  const handleDelete = async (kode: string, id: string) => {
    const ok = await confirmDelete(kode, "pesanan");
    if (!ok) return;
    deleteOrder({ params: { id } });
  };

  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setSearch("");
  };

  const handleResetChartFilter = () => {
    setFilterType("default");
    setDateRange(undefined);
  };

  const getFilterLabel = () => {
    if (filterType === "custom") {
      if (dateRange?.from && dateRange?.to) {
        return `${format(dateRange.from, "dd MMM yyyy", { locale: id })} - ${format(dateRange.to, "dd MMM yyyy", { locale: id })}`;
      } else if (dateRange?.from) {
        return `Dari ${format(dateRange.from, "dd MMM yyyy", { locale: id })}`;
      }
      return "Pilih Rentang Tanggal";
    }
    return `Tahun ${new Date().getFullYear()}`;
  };

  const toggleStatus = (value: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  };

  const columns = createColumns({
    onDetail: (id) => router.push(`/orders/list/${id}`),
    onDelete: handleDelete,
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

  const totalPesanan = stats?.total_pesanan ?? 0;

  const completedOrders = stats?.per_status?.["COMPLETED"] ?? 0;
  const processingOrders = stats?.per_status?.["PROCESSING"] ?? 0;

  const hasActiveFilters = selectedStatuses.length > 0 || !!search;

  return (
    <div className="flex flex-col gap-6">
      <DialogDelete />
      <h1 className="leading-none font-semibold text-2xl">Pesanan</h1>
      <div className="grid grid-cols-8 grid-rows-2 gap-4">
        {/* Chart */}
        <Card className="xl:col-span-6 col-span-8 row-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <Item className="flex flex-col items-start p-0 gap-1">
              <CardTitle>Total Pesanan</CardTitle>
              <CardDescription>
                Jumlah pesanan yang masuk pada periode tertentu.
              </CardDescription>
            </Item>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="justify-between text-left font-normal min-w-64"
                  >
                    <span className="text-sm">{getFilterLabel()}</span>
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex">
                  {/* Filter Type Sidebar */}
                  <div className="border-r">
                    <div className="p-2 space-y-1">
                      <Button
                        variant={
                          filterType === "default" ? "secondary" : "ghost"
                        }
                        className="w-full justify-start text-xs h-8"
                        onClick={() => setFilterType("default")}
                      >
                        Tahun Berjalan
                      </Button>
                      <Button
                        variant={
                          filterType === "custom" ? "secondary" : "ghost"
                        }
                        className="w-full justify-start text-xs h-8"
                        onClick={() => setFilterType("custom")}
                      >
                        Rentang Custom
                      </Button>
                      <Separator className="my-2" />
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs h-8"
                        onClick={handleResetChartFilter}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* Filter Content */}
                  <div className="p-4">
                    {filterType === "default" && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Filter: Tahun Berjalan
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Menampilkan data untuk tahun{" "}
                          {new Date().getFullYear()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Data dikelompokkan per bulan (Jan-Des)
                        </p>
                      </div>
                    )}

                    {filterType === "custom" && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">
                          Rentang Tanggal
                        </label>
                        <Calendar
                          mode="range"
                          selected={dateRange as DateRange | undefined}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          locale={id}
                        />
                        <p className="text-xs text-muted-foreground">
                          ≤90 hari: per hari | &gt;90 hari: per bulan
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-62.5 w-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Memuat data chart...
                </p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-62.5 w-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Tidak ada data</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-62.5 w-full">
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    dataKey="total_pesanan"
                    type="natural"
                    stroke="var(--color-total)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-total)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Stat: Total Pesanan */}
        <Card className="size-full col-span-4 xl:col-span-2 p-4 flex flex-col justify-between overflow-hidden bg-card">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-blue-500/10 border-blue-500/20">
              <ShoppingCart className="size-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-emerald-500/10 border-emerald-500/20">
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                All
              </span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-3xl font-bold leading-none mb-1 text-zinc-900 dark:text-white">
              {totalPesanan.toLocaleString("id-ID")}
            </p>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pesanan
            </p>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-500">
              Total pesanan keseluruhan
            </p>
          </div>
        </Card>

        {/* Stat: Selesai */}
        <Card className="size-full col-span-2 xl:col-span-1 p-4 flex flex-col justify-between overflow-hidden bg-card">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-emerald-500/10 border-emerald-500/20">
              <ShoppingCart className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-emerald-500/10 border-emerald-500/20">
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Selesai
              </span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-3xl font-bold leading-none mb-1 text-zinc-900 dark:text-white">
              {completedOrders.toLocaleString("id-ID")}
            </p>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pesanan
            </p>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-500">
              Selesai
            </p>
          </div>
        </Card>

        {/* Stat: Diproses */}
        <Card className="size-full col-span-2 xl:col-span-1 p-4 flex flex-col justify-between overflow-hidden bg-card">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-orange-500/10 border-orange-500/20">
              <ShoppingCart className="size-3.5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-orange-500/10 border-orange-500/20">
              <TrendingDown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                Proses
              </span>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-3xl font-bold leading-none mb-1 text-zinc-900 dark:text-white">
              {processingOrders.toLocaleString("id-ID")}
            </p>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pesanan
            </p>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-500">
              Sedang diproses
            </p>
          </div>
        </Card>
      </div>

      {/* Table section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Filter Status */}
            <Popover>
              <PopoverTrigger
                render={
                  <button className="flex items-center border border-gray-300 dark:border-gray-300/50 border-dashed rounded-md h-8 hover:bg-yellow-200 dark:hover:bg-yellow-300/30 transition cursor-default group">
                    <div className="text-xs font-medium h-full py-0 px-3 flex items-center gap-2">
                      <PlusCircle className="size-3" />
                      Status
                    </div>
                    {selectedStatuses.length > 0 && (
                      <>
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
                          {selectedStatuses.length}
                        </div>
                      </>
                    )}
                  </button>
                }
              />
              <PopoverContent
                portal={{ keepMounted: true }}
                className="p-0 max-w-56"
                align="start"
              >
                <Command className="p-0">
                  <CommandGroup>
                    {ORDER_STATUSES.map((s) => {
                      const isSelected = selectedStatuses.includes(s.value);
                      return (
                        <CommandItem
                          key={s.value}
                          className="text-xs"
                          onSelect={() => toggleStatus(s.value)}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-sm border",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-gray-500/50 dark:border-gray-300 opacity-50 [&_svg]:invisible",
                            )}
                          >
                            <Check className="text-primary-foreground size-3" />
                          </div>
                          {s.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {selectedStatuses.length > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          className="text-xs font-medium justify-center"
                          onSelect={() => setSelectedStatuses([])}
                        >
                          Clear filters
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button
                className="text-xs font-normal h-8 py-0 px-3"
                variant="ghost"
                onClick={handleResetFilters}
              >
                Reset
                <XCircle />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <InputSearch
              placeholder="Cari pesanan..."
              classNameWrap="w-60"
              value={search}
              setValue={setSearch}
            />
            <TooltipText
              value="Perbarui Data"
              render={
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                >
                  <RefreshCw className={cn(isRefetching && "animate-spin")} />
                </Button>
              }
            />
            <SortTable
              data={[
                { name: "Tanggal", value: "created_at" },
                { name: "Total", value: "total_bayar" },
              ]}
              order={order}
              sort={sort}
              setSort={setQuery}
            />
            <TooltipText
              value="Ekspor Data"
              render={
                <Button variant="outline" size="icon">
                  <Download />
                </Button>
              }
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={orders}
          isInitialLoading={isLoadList}
        />
        <Pagination
          pagination={metaPage}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
};
