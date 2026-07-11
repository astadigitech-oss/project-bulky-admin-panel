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

export type RetryBookingParams = BaseParams;

export type DeleteOrderParams = BaseParams;

export type CancelOrderParams = BaseParams;

export type CancelOrderBody = {
  reason?: string;
};

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
    shipping_info: {
      delivery_type: string;
      booking_id: string | null;
      tracking_no: string | null;
      booking_status: "NOT_APPLICABLE" | "PENDING" | "IN_PROGRESS" | "BOOKED" | "FAILED";
      booking_error: string | null;
    };
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
    biaya_lainnya: string;
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

export type CancelOrderResponse = BaseResponse & {
  data: {
    id: string;
    kode: string;
    previous_status: string;
    order_status: string;
    cancelled_reason: string | null;
    restored_produk_count: number;
    cancelled_at: string;
    cancelled_by: string;
  };
};

export type RetryBookingResponse = BaseResponse & {
  data: {
    pesanan_id: string;
    delivery_type: string;
    booking_id: string | null;
    tracking_no: string | null;
  };
};

export type OrderInvoiceRequest = BaseParams;

export type ForwarderInvoiceDetail = {
  freight_element_name: string;
  basis_name: string;
  total_idr: string;
  amount: string;
  total: string;
  subtotal: string;
  invoice_no: string;
  qty: string;
  container_type: string;
  currency: string;
  tax: string;
  remark: string;
};

export type ForwarderInvoice = {
  booking_no: string;
  invoice_no: string;
  due_date: string;
  invoice_id: string;
  currency: string;
  remark: string;
  create_date: string;
  download_invoice_url: string;
  data_detail: ForwarderInvoiceDetail[];
  invoice_date: string;
  quotation_no: string;
  status: string;
};

export type OrderInvoiceResponse = BaseResponse & {
  data: ForwarderInvoice[];
};

export type OrderTrackingRequest = BaseParams;

export type OrderDelivereeDetailRequest = BaseParams;

export type DelivereeVehicleTypeInfo = {
  id: number;
  name: string;
  cargo_length: number;
  cargo_height: number;
  cargo_width: number;
  cargo_weight: number;
  cargo_cubic_meter: number;
};

export type DelivereeDriver = {
  id: number;
  name: string;
  phone: string;
  driver_image_url: string;
  last_known_position_lat: number;
  last_known_position_lng: number;
};

export type DelivereeDeliveryLocation = {
  id: number;
  name: string;
  driver_note: string;
  note: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_status: string;
  failed_delivery_reason: string;
  signature_url: string;
  arrived_at: string;
  leaved_at: string;
  latitude: number;
  longitude: number;
  parking_fees: number;
  tolls_fees: number;
  waiting_time_fees: number;
  tracking_sharing: string;
};

export type DelivereeDeliveryDetail = {
  id: number;
  customer_name: string;
  driver_id: number;
  vehicle_type_info: DelivereeVehicleTypeInfo;
  time_type: string;
  status: string;
  note: string;
  total_fees: number;
  currency: string;
  tracking_url: string;
  job_order_number: string;
  created_at: string;
  pickup_time: string;
  completed_at: string;
  driver: DelivereeDriver | null;
  locations: DelivereeDeliveryLocation[];
  require_signatures: boolean;
  distance_fees: number;
  cod_pod_fees: number;
  cod_pod: boolean;
  surcharges_fees: number;
  way_point_fees: number;
};

export type OrderDelivereeDetailResponse = BaseResponse & {
  data: DelivereeDeliveryDetail;
};

export type TrackingEvent = {
  date: string;
  time: string;
  status: string;
};

export type TrackingResponse = BaseResponse & {
  data: {
    provider: string;
    booking_ref: string;
    status: string;
    tracking_url: string | null;
    history: TrackingEvent[];
  };
};
