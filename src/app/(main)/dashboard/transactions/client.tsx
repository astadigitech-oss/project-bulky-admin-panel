"use client";

import { useEffect, useState } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Download, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { CartesianGrid, Bar, BarChart, XAxis, YAxis } from "recharts";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DataTable from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import {
  exportTransaksi,
  useGetDasborKPI,
  useGetDasborPenjualanPerBuyer,
  useGetDasborStokPerKategori,
  useGetDasborTabelTransaksi,
  useGetDasborUserTransaksi,
} from "@/app/(main)/dashboard/_api";
import type {
  DasborTabelTransaksiItem,
  DasborUserTransaksiItem,
  PeriodeDasbor,
} from "@/app/(main)/dashboard/_api/types";

const PERIODE_OPTIONS: { label: string; value: PeriodeDasbor }[] = [
  { label: "Semua", value: "semua" },
  { label: "Bulan Ini", value: "bulan_ini" },
  { label: "Tahun Ini", value: "tahun_ini" },
];

const ORDER_STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  COMPLETED: {
    label: "Selesai",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  PROCESSING: {
    label: "Diproses",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);

function PeriodeDasborFilter({
  value,
  onChange,
}: {
  value: PeriodeDasbor;
  onChange: (v: PeriodeDasbor) => void;
}) {
  return (
    <div className="flex gap-1">
      {PERIODE_OPTIONS.map((opt) => (
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

const stokConfig: ChartConfig = {
  stok: { label: "Stok", color: "var(--chart-1)" },
};

const buyerConfig: ChartConfig = {
  total_pembelian: { label: "Total Pembelian", color: "var(--chart-2)" },
};

const tabelColumns: ColumnDef<DasborTabelTransaksiItem>[] = [
  { accessorKey: "kode", header: "Kode" },
  { accessorKey: "nama_pembeli", header: "Pembeli" },
  { accessorKey: "palet", header: "Palet" },
  { accessorKey: "kategori", header: "Kategori" },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.original.total),
  },
  { accessorKey: "tanggal_pesanan", header: "Tanggal" },
  {
    accessorKey: "order_status",
    header: "Status",
    cell: ({ row }) => {
      const status = ORDER_STATUS_MAP[row.original.order_status];
      return (
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            status?.className,
          )}
        >
          {status?.label ?? row.original.order_status}
        </span>
      );
    },
  },
];

const userColumns: ColumnDef<DasborUserTransaksiItem>[] = [
  { accessorKey: "nama", header: "Nama" },
  { accessorKey: "total_transaksi", header: "Jumlah Transaksi" },
  {
    accessorKey: "total_belanja",
    header: "Total Belanja",
    cell: ({ row }) => formatCurrency(row.original.total_belanja),
  },
];

export const DashboardTransactionClient = () => {
  const [{ fromUrl }, setQuery] = useQueryStates({
    fromUrl: parseAsString.withDefault(""),
  });

  useEffect(() => {
    if (fromUrl === "login") {
      toast.success("Anda telah login");
      setTimeout(() => setQuery({ fromUrl: "" }, { history: "replace" }), 500);
    }
  }, [fromUrl, setQuery]);

  const [periodeKPI, setPeriodeKPI] = useState<PeriodeDasbor>("semua");
  const [periodeBuyer, setPeriodeBuyer] = useState<PeriodeDasbor>("semua");
  const [periodeUser, setPeriodeUser] = useState<PeriodeDasbor>("semua");
  const [periodeTabel, setPeriodeTabel] = useState<PeriodeDasbor>("semua");
  const [halaman, setHalaman] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const { data: kpiRes, isLoading: loadingKPI } = useGetDasborKPI({
    periode: periodeKPI,
  });
  const { data: stokRes, isLoading: loadingStok } =
    useGetDasborStokPerKategori();
  const { data: buyerRes, isLoading: loadingBuyer } =
    useGetDasborPenjualanPerBuyer({ periode: periodeBuyer, limit: 10 });
  const { data: tabelRes, isLoading: loadingTabel } =
    useGetDasborTabelTransaksi({
      periode: periodeTabel,
      halaman,
      per_halaman: 10,
    });
  const { data: userRes, isLoading: loadingUser } = useGetDasborUserTransaksi({
    periode: periodeUser,
  });

  const kpi = kpiRes?.data;
  const stok = stokRes?.data;
  const buyer = buyerRes?.data;
  const tabelItems = tabelRes?.data ?? [];
  const tabelMeta = tabelRes?.meta;
  const userItems = userRes?.data ?? [];

  const stokChartData = (stok?.labels ?? []).map((label, i) => ({
    label,
    stok: stok?.series.stok[i] ?? 0,
  }));

  const buyerChartData = (buyer?.labels ?? []).map((label, i) => ({
    label,
    total_pembelian: buyer?.series.total_pembelian[i] ?? 0,
  }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTransaksi(periodeTabel);
    } catch {
      toast.error("Gagal mengekspor data transaksi");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePeriodeTabelChange = (v: PeriodeDasbor) => {
    setPeriodeTabel(v);
    setHalaman(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold leading-none">Dasbor Transaksi</h1>
        <PeriodeDasborFilter value={periodeKPI} onChange={setPeriodeKPI} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stok Paletbox
            </CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingKPI ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <p className="text-3xl font-bold">
                {(kpi?.stok_paletbox ?? 0).toLocaleString("id-ID")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paletbox Terjual
            </CardTitle>
            <ShoppingBag className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingKPI ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <p className="text-3xl font-bold">
                {(kpi?.paletbox_terjual ?? 0).toLocaleString("id-ID")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingKPI ? (
              <Skeleton className="h-9 w-36" />
            ) : (
              <p className="text-3xl font-bold">
                {formatCurrency(kpi?.revenue ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stok Per Kategori + Penjualan Per Buyer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Stok Per Kategori</CardTitle>
            <CardDescription>
              Distribusi stok berdasarkan kategori produk
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStok ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <ChartContainer config={stokConfig} className="h-[320px] w-full">
                <BarChart data={stokChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={110}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="stok"
                    fill="var(--chart-1)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Penjualan Per Buyer</CardTitle>
              <CardDescription>Top buyer berdasarkan total pembelian</CardDescription>
            </div>
            <PeriodeDasborFilter
              value={periodeBuyer}
              onChange={setPeriodeBuyer}
            />
          </CardHeader>
          <CardContent>
            {loadingBuyer ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <ChartContainer
                config={buyerConfig}
                className="h-[320px] w-full"
              >
                <BarChart data={buyerChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={120}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="total_pembelian"
                    fill="var(--chart-2)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaksi User */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Transaksi User</CardTitle>
            <CardDescription>Ringkasan transaksi per user</CardDescription>
          </div>
          <PeriodeDasborFilter value={periodeUser} onChange={setPeriodeUser} />
        </CardHeader>
        <CardContent>
          {loadingUser ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <DataTable columns={userColumns} data={userItems} />
          )}
        </CardContent>
      </Card>

      {/* Tabel Transaksi */}
      <Card>
        <CardHeader className="flex flex-wrap flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Tabel Transaksi</CardTitle>
            <CardDescription>
              Daftar transaksi berdasarkan periode
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PeriodeDasborFilter
              value={periodeTabel}
              onChange={handlePeriodeTabelChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="size-4 mr-1.5" />
              {isExporting ? "Mengekspor..." : "Export Excel"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loadingTabel ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <>
              <DataTable columns={tabelColumns} data={tabelItems} />
              {tabelMeta && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {tabelItems.length} dari {tabelMeta.total_data} data
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={halaman <= 1}
                      onClick={() => setHalaman((h) => Math.max(1, h - 1))}
                    >
                      Sebelumnya
                    </Button>
                    <span className="px-1 tabular-nums">
                      {halaman} / {tabelMeta.total_halaman}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={halaman >= tabelMeta.total_halaman}
                      onClick={() => setHalaman((h) => h + 1)}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
