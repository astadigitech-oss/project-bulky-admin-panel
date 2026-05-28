import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

// ─── Request ────────────────────────────────────────────────────────────────

export type OrderListRequest = BaseListParams & {
  status?: string;
  payment_status?: string;
  delivery_type?: string;
  tanggal_dari?: string;
  tanggal_sampai?: string;
};

export type OrderDetailRequest = BaseParams;

export type OrderStatisticsRequest = {
  tahun?: number;
  bulan?: number;
  minggu?: number;
  tanggal_dari?: string;
  tanggal_sampai?: string;
};

export type UpdateOrderStatusBody = {
  order_status: "PROCESSING" | "READY" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  note?: string;
};

export type UpdateOrderStatusParams = BaseParams;

export type DeleteOrderParams = BaseParams;

// ─── Response ───────────────────────────────────────────────────────────────

export type OrderItem = {
  id: string;
  buyer: {
    id: string;
    nama: string;
  };
  kode: string;
  total_bayar: string;
  total_item: number;
  payment_type: string;
  status:
    | "PENDING"
    | "PROCESSING"
    | "READY"
    | "SHIPPED"
    | "COMPLETED"
    | "CANCELLED";
  order_at: string | null;
};

export type OrderListResponse = BaseResponse & {
  data: OrderItem[];
  meta: MetaPagination;
};

export type OrderDetailResponse = BaseResponse & {
  data: {
    id: string;
    kode: string;
    buyer: {
      id: string;
      nama: string;
      email: string;
      telepon: string;
    };
    alamat_pengiriman: {
      id: string;
      label: string;
      nama_penerima: string;
      telepon: string;
      alamat_lengkap: string;
      kota: string;
      provinsi: string;
      kode_pos: string;
    } | null;
    delivery_type: string;
    payment_type: string;
    payment_status: string;
    order_status: string;
    items: {
      id: string;
      produk: {
        id: string;
        nama: string;
        slug: string;
        gambar_url: string;
      };
      nama_produk: string;
      qty: number;
      harga_satuan: string;
      diskon_satuan: string;
      subtotal: string;
    }[];
    pembayaran: {
      id: string;
      buyer_id: string;
      nama_pembayar: string;
      jumlah: string;
      metode_pembayaran: {
        id: string;
        nama: string;
        kode: string;
      };
      status: string;
      paid_at: string;
      xendit_invoice_id: string | null;
    }[];
    status_history: {
      status_from: string | null;
      status_to: string;
      status_type: string;
      note: string | null;
      created_at: string;
    }[];
    biaya_produk: string;
    biaya_pengiriman: string;
    biaya_ppn: string;
    potongan_kupon: string;
    total_bayar: string;
    catatan_buyer: string | null;
    catatan_admin: string | null;
    created_at: string;
    updated_at: string;
  };
};

export type OrderStatisticsResponse = BaseResponse & {
  data: {
    total_pesanan: number;
    total_revenue: string;
    per_status: Partial<Record<string, number>>;
    per_delivery_type: Partial<Record<string, number>>;
    per_payment_status: Partial<Record<string, number>>;
    chart_data: {
      label: string;
      period: string;
      total_pesanan: number;
    }[];
  };
};

export type UpdateOrderStatusResponse = BaseResponse & {
  data: {
    id: string;
    kode: string;
    order_status: string;
    previous_status: string;
    updated_at: string;
    updated_by: string;
  };
};

export type DeleteOrderResponse = BaseResponse;
