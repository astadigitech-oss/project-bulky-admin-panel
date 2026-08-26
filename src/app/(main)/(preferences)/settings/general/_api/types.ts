import { BaseParams, BaseResponse } from "@/lib/types";

type WhatsAppType = {
  id: string;
  nomor_wa: string;
  pesan_awal: string;
  updated_at: string;
  whatsapp_url: string;
};

type WarehouseType = {
  alamat: string;
  created_at: string;
  id: string;
  jam_operasional: string;
  kode_pos: string;
  kota: string;
  latitude: string;
  longitude: string;
  nama: string;
  updated_at: string;
};

export type ScheduleType = {
  hari: number;
  id: string;
  is_buka: boolean;
  jam_buka: null | string;
  jam_tutup: null | string;
  nama_hari: string;
};

export type PaymentType = {
  id: string;
  is_active: boolean;
  kode: string;
  logo_value: string;
  nama: string;
  urutan: number;
};

// query
export type WhatsAppHandlerResponse = BaseResponse & { data: WhatsAppType };

export type GetWarehouseResponse = BaseResponse & { data: WarehouseType };

export type GetScheduleResponse = BaseResponse & { data: ScheduleType[] };

export type GetPaymentResponse = BaseResponse & {
  data: {
    group: string;
    is_active: boolean;
    methods: PaymentType[];
    urutan: number;
  }[];
};

// mutation
export type UpdateWhatsAppHandlerBody = {
  nomor_wa: string;
  pesan_awal: string;
};

export type UpdateWhatsAppHandlerResponse = BaseResponse & {
  data: WhatsAppType;
};

export type UpdateProfileBody = {
  email: string;
  nama: string;
};

export type UpdateProfileResponse = BaseResponse & {
  data: {
    id: string;
    nama: string;
    email: string;
  };
};

export type ChangePasswordBody = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type ChangePasswordResponse = BaseResponse;

export type UpdateWarehouseBody = {
  alamat: string;
  jam_operasional: string;
  kode_pos: string;
  kota: string;
  latitude: number;
  longitude: number;
  nama: string;
};

export type UpdateWarehouseResponse = BaseResponse & {
  data: WarehouseType;
};

export type UpdateScheduleBody = {
  jadwal: {
    /**
     * 0-6 (0=Minggu, 6=Sabtu)
     */
    hari: number;
    /**
     * If `is_buka=true`, then `jam_buka` and `jam_tutup` must be provided
     */
    is_buka: boolean;
    /**
     * format "HH:mm"
     */
    jam_buka: null | string;
    /**
     * format "HH:mm"
     */
    jam_tutup: null | string;
  }[];
};

export type UpdateScheduleResponse = BaseResponse;

export type UpdatePaymentParams = BaseParams;

export type UpdatePaymentResponse = BaseResponse & {
  data: { id: string; is_active: boolean; kode: string; nama: string };
};

// --- Asset migration (v1) ---
export type ImportV1Body = FormData;

export type ImportV1FileItem = {
  source: string;
  dest: string;
  status: "imported" | "skipped";
  reason?: string;
};

export type ImportV1Response = BaseResponse & {
  data: {
    imported: number;
    skipped: number;
    unmatched: string[];
    files: ImportV1FileItem[];
  };
};

// --- Asset migration (v1) — chunk upload ---
export type PruneOrphansBody = {
  dry_run: boolean;
  dry_run_token?: string;
};

export type PruneOrphanItem = {
  path: string;
  size: number;
};

export type PruneOrphansResponse = BaseResponse & {
  data: {
    dry_run: boolean;
    total_files: number;
    total_size: number;
    deleted: number;
    orphans: PruneOrphanItem[];
    dry_run_token: string;
    token_expiry_s: number;
  };
};

// --- Asset migration (v1) — verifikasi konsistensi DB ↔ file fisik ---
export type VerifyAssetItem = {
  path: string;
  count?: number;
};

export type VerifyAssetsResponse = BaseResponse & {
  data: {
    referenced: number;
    missing: VerifyAssetItem[];
    duplicates: VerifyAssetItem[];
  };
};

// --- Asset migration (v1) — housekeeping chunk upload basi ---
export type PendingV1UploadItem = {
  upload_id: string;
  chunk_count: number;
  total_size: number;
  last_modified: string;
};

export type ListPendingV1UploadsResponse = BaseResponse & {
  data: {
    pending_uploads: PendingV1UploadItem[];
    stale_tmp_files: string[];
    total_pending_size: number;
  };
};

export type CleanupStaleV1UploadsBody = {
  older_than_hours?: number;
  dry_run: boolean;
  dry_run_token?: string;
};

export type CleanupStaleV1UploadsResponse = BaseResponse & {
  data: {
    dry_run: boolean;
    older_than_hours: number;
    deleted_uploads: string[];
    deleted_tmp_files: string[];
    freed_size: number;
    dry_run_token: string;
    token_expiry_s: number;
  };
};

// --- Global WebP Image Optimizer ---
export type OptimizeWebPBody = {
  dry_run: boolean;
  dry_run_token?: string;
  scope?: string;
};

export type OptimizeWebPItem = {
  scope: string;
  table: string;
  column: string;
  record_id: string;
  old_path: string;
  new_path?: string;
  old_size_bytes: number;
  new_size_bytes?: number;
  saved_bytes?: number;
  status: "converted" | "candidate" | "already_optimal" | "missing" | "failed";
  error_message?: string;
};

export type OptimizeWebPResponse = BaseResponse & {
  data: {
    dry_run: boolean;
    scope: string;
    total_scanned: number;
    total_candidates: number;
    total_converted: number;
    total_skipped: number;
    total_missing: number;
    total_failed: number;
    original_size_bytes: number;
    new_size_bytes: number;
    saved_size_bytes: number;
    saved_percentage: number;
    dry_run_token: string;
    token_expiry_s: number;
    items: OptimizeWebPItem[];
  };
};
