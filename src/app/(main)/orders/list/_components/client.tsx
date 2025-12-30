"use client";

import { Download, RefreshCcw, ShoppingCart, TrendingUp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { SortTable } from "@/components/sort-table";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { column } from "./columns";

export const description = "A line chart with dots";
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];
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

export const OrderListClient = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created"),
    order: parseAsString.withDefault("desc"),
  });
  const { search, setSearch } = useSearchQuery();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="leading-none font-semibold text-2xl">Pesanan</h1>
      <div className="grid grid-cols-8 grid-rows-2 gap-4">
        <Card className="xl:col-span-6 col-span-8 row-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <Item className="flex flex-col items-start p-0 gap-1">
              <CardTitle>Total Pesanan</CardTitle>
              <CardDescription>
                Jumlah pesanan yang masuk pada periode tertentu.
              </CardDescription>
            </Item>
            <Select>
              <SelectTrigger>
                <SelectValue
                  placeholder="Select Range"
                  className={"capitalize"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"week"}>Week</SelectItem>
                <SelectItem value={"month"}>Month</SelectItem>
                <SelectItem value={"year"}>Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-50 w-full">
              <LineChart
                accessibilityLayer
                data={chartData}
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
        <Card className="size-full col-span-4 xl:col-span-2 p-4 flex flex-col justify-between overflow-hidden bg-card">
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
        <Card className="size-full col-span-2 xl:col-span-1 p-4 flex flex-col justify-between overflow-hidden bg-card">
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
        <Card className="size-full col-span-2 xl:col-span-1 p-4 flex flex-col justify-between overflow-hidden bg-card">
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari pesanan..."
            classNameWrap="w-80"
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
            data={[{ name: "Name", value: "name" }]}
            order={order}
            sort={sort}
            setSort={setQuery}
          />
          <TooltipText
            value="Ekspor Data"
            render={
              <Button variant={"outline"} size={"icon"}>
                <Download />
              </Button>
            }
          />
        </div>
        <DataTable
          columns={column}
          data={[
            {
              orderId: "ysgva8iwefhjoiah",
              name: "Ahman",
              date: new Date("2025-12-30T07:00:00"),
              total: "Rp 500.000",
              status: "delivered",
            },
          ]}
        />
      </div>
    </div>
  );
};
