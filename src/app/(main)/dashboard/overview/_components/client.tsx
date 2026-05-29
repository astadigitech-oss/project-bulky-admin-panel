"use client";

import { useState } from "react";
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
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetChartTransaksi,
  useGetChartRevenue,
  useGetChartTransaksiPerKategori,
} from "@/app/(main)/dashboard/_api";
import type { PeriodeChart } from "@/app/(main)/dashboard/_api/types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const PERIODE_CHART_OPTIONS: { label: string; value: PeriodeChart }[] = [
  { label: "Bulan Ini", value: "bulan_ini" },
  { label: "Tahun Ini", value: "tahun_ini" },
];

function PeriodeChartFilter({
  value,
  onChange,
}: {
  value: PeriodeChart;
  onChange: (v: PeriodeChart) => void;
}) {
  return (
    <div className="flex gap-1">
      {PERIODE_CHART_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);

const chartTransaksiConfig = {
  success: { label: "Berhasil", color: "var(--chart-1)" },
  cancel: { label: "Dibatalkan", color: "var(--chart-2)" },
} satisfies ChartConfig;

const chartRevenueConfig = {
  total_penjualan: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

export const DashboardOverviewClient = () => {
  const [periodeTransaksi, setPeriodeTransaksi] =
    useState<PeriodeChart>("tahun_ini");
  const [periodeRevenue, setPeriodeRevenue] =
    useState<PeriodeChart>("tahun_ini");
  const [periodeKategori, setPeriodeKategori] =
    useState<PeriodeChart>("tahun_ini");

  const { data: transaksiRes, isLoading: loadingTransaksi } =
    useGetChartTransaksi({ periode: periodeTransaksi });
  const { data: revenueRes, isLoading: loadingRevenue } = useGetChartRevenue({
    periode: periodeRevenue,
  });
  const { data: kategoriRes, isLoading: loadingKategori } =
    useGetChartTransaksiPerKategori({ periode: periodeKategori });

  const transaksiData = (transaksiRes?.data.labels ?? []).map((label, i) => ({
    label,
    success: transaksiRes?.data.series.success[i] ?? 0,
    cancel: transaksiRes?.data.series.cancel[i] ?? 0,
  }));

  const revenueData = (revenueRes?.data.labels ?? []).map((label, i) => ({
    label,
    total_penjualan: revenueRes?.data.series.total_penjualan[i] ?? 0,
  }));

  const kategoriSeries = kategoriRes?.data.series ?? [];
  const kategoriData = (kategoriRes?.data.labels ?? []).map((label, i) => {
    const entry: Record<string, string | number> = { label };
    kategoriSeries.forEach((s) => {
      entry[s.kategori_id] = s.data[i] ?? 0;
    });
    return entry;
  });

  const kategoriConfig: ChartConfig = {};
  kategoriSeries.forEach((s, idx) => {
    kategoriConfig[s.kategori_id] = {
      label: s.kategori,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold leading-none">Ringkasan Dasbor</h1>

      {/* Chart Transaksi */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Chart Transaksi</CardTitle>
            <CardDescription>
              Jumlah transaksi berhasil dan dibatalkan
            </CardDescription>
          </div>
          <PeriodeChartFilter
            value={periodeTransaksi}
            onChange={setPeriodeTransaksi}
          />
        </CardHeader>
        <CardContent>
          {loadingTransaksi ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ChartContainer
              config={chartTransaksiConfig}
              className="h-[300px] w-full"
            >
              <LineChart data={transaksiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="var(--chart-1)"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cancel"
                  stroke="var(--chart-2)"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Chart Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Chart Revenue</CardTitle>
            <CardDescription>
              Total:{" "}
              {revenueRes
                ? formatCurrency(revenueRes.data.total_keseluruhan)
                : "-"}
            </CardDescription>
          </div>
          <PeriodeChartFilter
            value={periodeRevenue}
            onChange={setPeriodeRevenue}
          />
        </CardHeader>
        <CardContent>
          {loadingRevenue ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ChartContainer
              config={chartRevenueConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total_penjualan"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Chart Transaksi Per Kategori */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Transaksi Per Kategori</CardTitle>
            <CardDescription>
              Jumlah transaksi berdasarkan kategori produk
            </CardDescription>
          </div>
          <PeriodeChartFilter
            value={periodeKategori}
            onChange={setPeriodeKategori}
          />
        </CardHeader>
        <CardContent>
          {loadingKategori ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ChartContainer
              config={kategoriConfig}
              className="h-[300px] w-full"
            >
              <LineChart data={kategoriData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {kategoriSeries.map((s, idx) => (
                  <Line
                    key={s.kategori_id}
                    type="monotone"
                    dataKey={s.kategori_id}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                    name={s.kategori}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
