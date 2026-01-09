"use client";

import {
  CalendarDaysIcon,
  CircleIcon,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
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
import { useDeleteBuyer, useGetBuyerList } from "../_api";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getWeeksInMonth,
  getYear,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import { Activity, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";
import { Radio } from "@base-ui/react/radio";
import { Separator } from "@/components/ui/separator-extended";
import { Calendar } from "@/components/ui/calendar";
import { useSidebar } from "@/components/ui/sidebar";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const CustomersClient = () => {
  const today = new Date();
  const startMonth = startOfMonth(today);
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created_at"),
    order: parseAsString.withDefault("desc"),
  });

  const [rangeDate, setRangeDate] = useState<DateRange | undefined>({
    from: startMonth,
    to: today,
  });
  const [typeChart, setTypeChart] = useState<
    "year" | "month" | "week" | "custom"
  >("year");
  const [isOpen, setIsOpen] = useState(false);

  const [DialogDelete, confirmDelete] = useConfirm(
    "Delete [user]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const { mutate: deleteBuyer, isPending: isDeleting } = useDeleteBuyer();

  const { search, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit } = usePagination();
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

  const buyerList = list?.data ?? [];

  const isDisabled = isDeleting || isLoadList;

  const handleDelete = async (user: string, userId: string) => {
    const ok = await confirmDelete(user, "user");
    if (!ok) return;
    deleteBuyer({ params: { id: userId } });
  };

  const getRangeOfWeeks = () => {
    const totalWeek = getWeeksInMonth(today, { weekStartsOn: 1 });

    const endMonth = endOfMonth(today);

    const rangeWeek = eachWeekOfInterval(
      { start: startMonth, end: endMonth },
      { weekStartsOn: 1 },
    ).map((weekStart, i) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      return {
        week: i + 1,
        start: format(i === 0 ? startMonth : weekStart, "d MMM", {
          locale: id,
        }),
        end: format(weekEnd > endMonth ? endMonth : weekEnd, "d MMM", {
          locale: id,
        }),
      };
    });

    return {
      total: totalWeek,
      range: rangeWeek,
    };
  };

  const getRangeOfYears = () => {
    const initialYear = 2024;
    const currentYear = getYear(today);
    return Array.from(
      { length: currentYear - initialYear + 1 },
      (_, i) => currentYear - i,
    );
  };

  const getRangeOfMonths = () => {
    return eachMonthOfInterval({
      start: startOfYear(today),
      end: today,
    }).map((i) => format(i, "MMMM", { locale: id }));
  };

  const { open: openSidebar } = useSidebar();

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogDelete />
      <h1 className="leading-none font-semibold text-2xl">Pelanggan</h1>
      <div className="grid grid-cols-8 grid-rows-2 gap-4">
        <Card
          className={cn(
            "col-span-8 row-span-2",
            openSidebar ? "2xl:col-span-6" : "xl:col-span-6",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <Item className="flex flex-col items-start p-0 gap-1">
              <CardTitle>Total Pelanggan</CardTitle>
              <CardDescription>
                Jumlah pelanggan pada periode tertentu.
              </CardDescription>
            </Item>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger
                render={
                  <Button>
                    <CalendarDaysIcon className="size-3.5" />
                    Select Range
                  </Button>
                }
              />
              <DialogContent
                className={"w-auto min-w-lg"}
                showCloseButton={false}
              >
                <DialogHeader>
                  <DialogTitle>Pilih Periode</DialogTitle>
                </DialogHeader>
                <div>
                  <RadioGroup
                    value={typeChart}
                    onValueChange={(v) =>
                      setTypeChart(v as "year" | "month" | "week" | "custom")
                    }
                  >
                    <Radio.Root
                      value={"year"}
                      data-slot="checkbox"
                      className={
                        "border border-primary/30 dark:border-primary/50 rounded-lg relative data-checked:border-primary  flex flex-col group"
                      }
                    >
                      <div className="flex items-center p-3 group-data-checked:bg-primary/10 dark:data-checked:bg-primary/5">
                        <p className="pointer-events-none font-semibold">
                          Tahun
                        </p>
                        <div className="size-4 border border-primary/30 dark:border-primary/50 group-data-checked:border-primary rounded-full justify-center relative ml-auto">
                          <Radio.Indicator
                            data-slot="radio-group-indicator"
                            className="text-primary flex size-full items-center justify-center"
                          >
                            <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current" />
                          </Radio.Indicator>
                        </div>
                      </div>
                      <Activity
                        mode={typeChart === "year" ? "visible" : "hidden"}
                      >
                        <Separator
                          variant={"dashed"}
                          className={"bg-gray-400"}
                        />
                        <div className="p-3 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-3">
                          <p>Pilih tahun:</p>
                          <Select defaultValue={getRangeOfYears()[0]}>
                            <SelectTrigger size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getRangeOfYears().map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </Activity>
                    </Radio.Root>
                    <Radio.Root
                      value={"month"}
                      data-slot="checkbox"
                      className={
                        "border border-primary/30 dark:border-primary/50 rounded-lg relative data-checked:border-primary  flex flex-col group"
                      }
                    >
                      <div className="flex items-center p-3 group-data-checked:bg-primary/10 dark:data-checked:bg-primary/5">
                        <p className="pointer-events-none font-semibold">
                          Bulan
                        </p>
                        <div className="size-4 border border-primary/30 dark:border-primary/50 group-data-checked:border-primary rounded-full justify-center relative ml-auto">
                          <Radio.Indicator
                            data-slot="radio-group-indicator"
                            className="text-primary flex size-full items-center justify-center"
                          >
                            <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current" />
                          </Radio.Indicator>
                        </div>
                      </div>
                      <Activity
                        mode={typeChart === "month" ? "visible" : "hidden"}
                      >
                        <Separator
                          variant={"dashed"}
                          className={"bg-gray-400"}
                        />
                        <div className="p-3 text-gray-700 dark:text-gray-300 flex items-center gap-3">
                          <p>Pilih Bulan:</p>
                          <Select defaultValue={getRangeOfMonths()[0]}>
                            <SelectTrigger size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getRangeOfMonths().map((month) => (
                                <SelectItem key={month} value={month}>
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </Activity>
                    </Radio.Root>
                    <Radio.Root
                      value={"week"}
                      data-slot="checkbox"
                      className={
                        "border border-primary/30 dark:border-primary/50 rounded-lg relative data-checked:border-primary  flex flex-col group"
                      }
                    >
                      <div className="flex items-center p-3 group-data-checked:bg-primary/10 dark:data-checked:bg-primary/5">
                        <p className="pointer-events-none font-semibold">
                          Minggu
                        </p>
                        <div className="size-4 border border-primary/30 dark:border-primary/50 group-data-checked:border-primary rounded-full justify-center relative ml-auto">
                          <Radio.Indicator
                            data-slot="radio-group-indicator"
                            className="text-primary flex size-full items-center justify-center"
                          >
                            <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current" />
                          </Radio.Indicator>
                        </div>
                      </div>
                      <Activity
                        mode={typeChart === "week" ? "visible" : "hidden"}
                      >
                        <Separator
                          variant={"dashed"}
                          className={"bg-gray-400"}
                        />
                        <div className="p-3 text-gray-700 dark:text-gray-300 flex items-center gap-3">
                          <p>Pilih Minggu:</p>
                          <Select defaultValue={getRangeOfWeeks()["range"][0]}>
                            <SelectTrigger size="sm">
                              <SelectValue>
                                {(
                                  e: ReturnType<
                                    typeof getRangeOfWeeks
                                  >["range"][number],
                                ) => (
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs">Ke-{e.week}</p>
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                      {e.start} - {e.end}
                                    </span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className={"w-auto"}>
                              {getRangeOfWeeks().range.map((week) => (
                                <SelectItem key={week.week} value={week}>
                                  <p className="text-xs">Ke-{week.week}</p>
                                  <span className="text-xs text-gray-700 dark:text-gray-300 w-fit ml-auto bg-gray-100 dark:bg-gray-700 px-2 rounded">
                                    {week.start} - {week.end}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </Activity>
                    </Radio.Root>
                    <Radio.Root
                      value={"custom"}
                      data-slot="checkbox"
                      className={
                        "border border-primary/30 dark:border-primary/50 rounded-lg relative data-checked:border-primary  flex flex-col group"
                      }
                    >
                      <div className="flex items-center p-3 group-data-checked:bg-primary/10 dark:data-checked:bg-primary/5">
                        <p className="pointer-events-none font-semibold">
                          Custom
                        </p>
                        <div className="size-4 border border-primary/30 dark:border-primary/50 group-data-checked:border-primary rounded-full justify-center relative ml-auto">
                          <Radio.Indicator
                            data-slot="radio-group-indicator"
                            className="text-primary flex size-full items-center justify-center"
                          >
                            <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current" />
                          </Radio.Indicator>
                        </div>
                      </div>
                      <Activity
                        mode={typeChart === "custom" ? "visible" : "hidden"}
                      >
                        <Separator
                          variant={"dashed"}
                          className={"bg-gray-400"}
                        />
                        <div className="p-3 text-gray-700 dark:text-gray-300 flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <p>Pilih Range Tanggal:</p>
                            <p className="bg-gray-100 dark:bg-gray-700 px-2 rounded py-0.5">
                              {rangeDate?.from && rangeDate?.to
                                ? `${format(rangeDate?.from, "dd MMM yyyy")} - ${format(rangeDate?.to, "dd MMM yyyy")}`
                                : "-"}
                            </p>
                          </div>
                          <div className="p-1 rounded-md overflow-hidden bg-background flex items-center justify-center w-full border border-gray-300 dark:border-gray-500/70">
                            <Calendar
                              mode="range"
                              numberOfMonths={2}
                              selected={rangeDate}
                              month={subMonths(today, 1)}
                              onSelect={setRangeDate}
                            />
                          </div>
                        </div>
                      </Activity>
                    </Radio.Root>
                  </RadioGroup>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsOpen(false)}>Selesai</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-50 w-full">
              <LineChart
                accessibilityLayer
                data={[]}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="desktop"
                  type="natural"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-desktop)",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "size-full col-span-4 p-4 flex flex-col justify-between overflow-hidden bg-card",
            openSidebar ? "2xl:col-span-2" : "xl:col-span-2",
          )}
        >
          {/* Header dengan icon dan trend */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-blue-500/10 border-blue-500/20">
              <ShoppingCart className="size-3.5 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-emerald-500/10 border-emerald-500/20">
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {Math.abs(20)}%
              </span>
            </div>
          </div>

          {/* Content area */}
          <div className="relative z-10">
            <p className="text-3xl font-bold leading-none mb-1 text-zinc-900 dark:text-white">
              {(300).toLocaleString("id-ID")}
            </p>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pesanan
            </p>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-500">
              Total pesanan keseluruhan
            </p>
          </div>
        </Card>
        <Card
          className={cn(
            "size-full col-span-2  p-4 flex flex-col justify-between overflow-hidden bg-card",
            openSidebar ? "2xl:col-span-1" : "xl:col-span-1",
          )}
        >
          {/* Header dengan icon dan trend */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-blue-500/10 border-blue-500/20">
              <ShoppingCart className="size-3.5 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-emerald-500/10 border-emerald-500/20">
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {Math.abs(20)}%
              </span>
            </div>
          </div>

          {/* Content area */}
          <div className="relative z-10">
            <p className="text-3xl font-bold leading-none mb-1 text-zinc-900 dark:text-white">
              {(300).toLocaleString("id-ID")}
            </p>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pesanan
            </p>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-500">
              Dalam setahun
            </p>
          </div>
        </Card>
        <Card
          className={cn(
            "size-full col-span-2  p-4 flex flex-col justify-between overflow-hidden bg-card",
            openSidebar ? "2xl:col-span-1" : "xl:col-span-1",
          )}
        >
          {/* Header dengan icon dan trend */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-blue-500/10 border-blue-500/20">
              <ShoppingCart className="size-3.5 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-emerald-500/10 border-emerald-500/20">
              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {Math.abs(20)}%
              </span>
            </div>
          </div>

          {/* Content area */}
          <div className="relative z-10">
            <p className="text-3xl font-bold leading-none mb-1 text-zinc-900 dark:text-white">
              {(300).toLocaleString("id-ID")}
            </p>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pesanan
            </p>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-500">
              Dalam sebulan
            </p>
          </div>
        </Card>
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
