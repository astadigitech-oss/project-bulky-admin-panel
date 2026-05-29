// ─── Shared ───────────────────────────────────────────────────────────────────

export type PeriodeChart = "bulan_ini" | "tahun_ini";
export type PeriodeDasbor = "semua" | "bulan_ini" | "tahun_ini";

// ─── Ringkasan Dasbor ─────────────────────────────────────────────────────────

export type ChartTransaksiResponse = {
  success: boolean;
  message: string;
  data: {
    periode: string;
    labels: string[];
    series: { success: number[]; cancel: number[] };
  };
};

export type ChartRevenueResponse = {
  success: boolean;
  message: string;
  data: {
    periode: string;
    labels: string[];
    series: { total_penjualan: number[] };
    total_keseluruhan: number;
  };
};

export type ChartTransaksiPerKategoriResponse = {
  success: boolean;
  message: string;
  data: {
    periode: string;
    labels: string[];
    series: { kategori: string; kategori_id: string; data: number[] }[];
  };
};

// ─── Dasbor Transaksi ─────────────────────────────────────────────────────────

export type DasborKPIResponse = {
  success: boolean;
  message: string;
  data: {
    periode: string;
    stok_paletbox: number;
    paletbox_terjual: number;
    revenue: number;
  };
};

export type DasborStokPerKategoriResponse = {
  success: boolean;
  message: string;
  data: {
    labels: string[];
    series: { stok: number[] };
  };
};

export type DasborPenjualanPerBuyerResponse = {
  success: boolean;
  message: string;
  data: {
    periode: string;
    labels: string[];
    series: { total_pembelian: number[] };
    buyers: { buyer_id: string; nama: string; total_pembelian: number }[];
  };
};

export type DasborTabelTransaksiItem = {
  pesanan_id: string;
  kode: string;
  nama_pembeli: string;
  palet: string;
  kategori: string;
  harga: number;
  ongkos_kirim: number;
  diskon: number;
  total: number;
  tanggal_pesanan: string;
  delivery_type: string;
  payment_type: string;
  order_status: "COMPLETED" | "PROCESSING" | "CANCELLED";
  jenis_pembayaran: string[];
};

export type DasborTabelTransaksiResponse = {
  success: boolean;
  message: string;
  data: DasborTabelTransaksiItem[];
  meta: {
    halaman: number;
    per_halaman: number;
    total_data: number;
    total_halaman: number;
  };
};

export type DasborUserTransaksiItem = {
  buyer_id: string;
  nama: string;
  total_transaksi: number;
  total_belanja: number;
};

export type DasborUserTransaksiResponse = {
  success: boolean;
  message: string;
  data: DasborUserTransaksiItem[];
};
