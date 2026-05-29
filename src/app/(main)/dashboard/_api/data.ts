import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData } from "@tanstack/react-query";
import {
  ChartRevenueResponse,
  ChartTransaksiPerKategoriResponse,
  ChartTransaksiResponse,
  DasborKPIResponse,
  DasborPenjualanPerBuyerResponse,
  DasborStokPerKategoriResponse,
  DasborTabelTransaksiResponse,
  DasborUserTransaksiResponse,
  PeriodeChart,
  PeriodeDasbor,
} from "./types";

export const dataAPIDashboard = {
  chartTransaksi: (params: {
    periode?: PeriodeChart;
  }): UseApiQueryProps<ChartTransaksiResponse> => ({
    key: ["dasbor-chart-transaksi", params],
    endpoint: "/dasbor/chart-transaksi",
    searchParams: { periode: params.periode },
    placeholderData: keepPreviousData,
  }),

  chartRevenue: (params: {
    periode?: PeriodeChart;
  }): UseApiQueryProps<ChartRevenueResponse> => ({
    key: ["dasbor-chart-revenue", params],
    endpoint: "/dasbor/chart-revenue",
    searchParams: { periode: params.periode },
    placeholderData: keepPreviousData,
  }),

  chartTransaksiPerKategori: (params: {
    periode?: PeriodeChart;
  }): UseApiQueryProps<ChartTransaksiPerKategoriResponse> => ({
    key: ["dasbor-chart-transaksi-per-kategori", params],
    endpoint: "/dasbor/chart-transaksi-per-kategori",
    searchParams: { periode: params.periode },
    placeholderData: keepPreviousData,
  }),

  kpi: (params: {
    periode?: PeriodeDasbor;
  }): UseApiQueryProps<DasborKPIResponse> => ({
    key: ["dasbor-kpi", params],
    endpoint: "/dasbor/kpi",
    searchParams: { periode: params.periode },
    placeholderData: keepPreviousData,
  }),

  stokPerKategori: (): UseApiQueryProps<DasborStokPerKategoriResponse> => ({
    key: ["dasbor-stok-per-kategori"],
    endpoint: "/dasbor/stok-per-kategori",
    placeholderData: keepPreviousData,
  }),

  penjualanPerBuyer: (params: {
    periode?: PeriodeDasbor;
    limit?: number;
  }): UseApiQueryProps<DasborPenjualanPerBuyerResponse> => ({
    key: ["dasbor-penjualan-per-buyer", params],
    endpoint: "/dasbor/penjualan-per-buyer",
    searchParams: { periode: params.periode, limit: params.limit },
    placeholderData: keepPreviousData,
  }),

  tabelTransaksi: (params: {
    periode?: PeriodeDasbor;
    halaman?: number;
    per_halaman?: number;
  }): UseApiQueryProps<DasborTabelTransaksiResponse> => ({
    key: ["dasbor-tabel-transaksi", params],
    endpoint: "/dasbor/tabel-transaksi",
    searchParams: {
      periode: params.periode,
      halaman: params.halaman,
      per_halaman: params.per_halaman,
    },
    placeholderData: keepPreviousData,
  }),

  userTransaksi: (params: {
    periode?: PeriodeDasbor;
  }): UseApiQueryProps<DasborUserTransaksiResponse> => ({
    key: ["dasbor-user-transaksi", params],
    endpoint: "/dasbor/user-transaction",
    searchParams: { periode: params.periode },
    placeholderData: keepPreviousData,
  }),
};
