import axios from "axios";
import { getCookie } from "cookies-next/client";
import { useApiQuery } from "@/lib/query/use-query";
import { apiUrl, cookiesKey } from "@/config";
import { dataAPIDashboard } from "./data";
import type { PeriodeChart, PeriodeDasbor } from "./types";

// ─── Ringkasan Dasbor ─────────────────────────────────────────────────────────

export const useGetChartTransaksi = (params: { periode?: PeriodeChart }) =>
  useApiQuery(dataAPIDashboard.chartTransaksi(params));

export const useGetChartRevenue = (params: { periode?: PeriodeChart }) =>
  useApiQuery(dataAPIDashboard.chartRevenue(params));

export const useGetChartTransaksiPerKategori = (params: {
  periode?: PeriodeChart;
}) => useApiQuery(dataAPIDashboard.chartTransaksiPerKategori(params));

// ─── Dasbor Transaksi ─────────────────────────────────────────────────────────

export const useGetDasborKPI = (params: { periode?: PeriodeDasbor }) =>
  useApiQuery(dataAPIDashboard.kpi(params));

export const useGetDasborStokPerKategori = () =>
  useApiQuery(dataAPIDashboard.stokPerKategori());

export const useGetDasborPenjualanPerBuyer = (params: {
  periode?: PeriodeDasbor;
  limit?: number;
}) => useApiQuery(dataAPIDashboard.penjualanPerBuyer(params));

export const useGetDasborTabelTransaksi = (params: {
  periode?: PeriodeDasbor;
  halaman?: number;
  per_halaman?: number;
}) => useApiQuery(dataAPIDashboard.tabelTransaksi(params));

export const useGetDasborUserTransaksi = (params: {
  periode?: PeriodeDasbor;
}) => useApiQuery(dataAPIDashboard.userTransaksi(params));

// ─── Export ───────────────────────────────────────────────────────────────────

export const exportTransaksi = async (periode?: PeriodeDasbor) => {
  const token = getCookie(cookiesKey);
  const params = new URLSearchParams();
  if (periode) params.append("periode", periode);

  const url = `${apiUrl}/dasbor/ekspor-transaksi${params.toString() ? `?${params}` : ""}`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

  const blob = new Blob([response.data]);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const periodeLabel =
    periode === "bulan_ini"
      ? "Bulan Ini"
      : periode === "tahun_ini"
        ? "Tahun Ini"
        : "Semua";
  link.download = `Transaksi Bulky - ${periodeLabel}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
