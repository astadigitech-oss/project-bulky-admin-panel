import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// types
// ------partials------
export type BuyerListRequest = BaseParams;

export type BuyerDetailRequest = BaseListParams;

export type BuyerChartRequest = {
  filter?: "year" | "month" | "week" | "custom";
  tahun?: number;
  bulan?: number;
  minggu?: number;
  tanggal_dari?: string;
  tanggal_sampai?: string;
};

// ------query------
export type BuyerListResponse = BaseResponse & {
  data: {
    created_at: string;
    email: string;
    id: string;
    nama: string;
    telepon: string;
    username: string;
  }[];
  meta: MetaPagination;
};

type BuyerDetailResponse = BaseResponse & {
  data: {
    alamat: {
      alamat_formatted?: string;
      alamat_lengkap?: string;
      buyer_id?: string;
      catatan?: string;
      created_at?: string;
      google_place_id?: string;
      id?: string;
      is_default?: boolean;
      kecamatan?: string;
      kelurahan?: string;
      kode_pos?: string;
      kota?: string;
      label?: string;
      latitude?: number;
      longitude?: number;
      nama_penerima?: string;
      provinsi?: string;
      telepon_penerima?: string;
      updated_at?: string;
    }[];
    created_at: string;
    email: string;
    foto_url: null;
    id: string;
    nama: string;
    telepon: string;
    updated_at: string;
    username: string;
  };
};

type BuyerChartResponse = BaseResponse & {
  data: {
    chart: { date: string; user: number }[];
    mode: string;
    total: number;
  };
};

type BuyerStatResponse = BaseResponse & {
  data: {
    /**
     * Buyer yang sudah verifikasi
     */
    buyer_verified: number;
    /**
     * Presentasi buyer terdaftar bulan ini vs bulan sebelumnya
     */
    persentase_bulan_ini: {
      /**
       * Total buyer bulan ini
       */
      current: number;
      /**
       * Total buyer bulan lalu
       */
      previous: number;
      /**
       * "up" / "down" / "stable"
       */
      trend: "up" | "down" | "stable";
      /**
       * Persentase perubahan vs bulan lalu
       */
      value: number;
    };
    /**
     * Presentasi buyer terdaftar tahun ini vs tahun sebelumnya
     */
    persentase_tahun_ini: {
      /**
       * Total buyer bulan ini
       */
      current: number;
      /**
       * Total buyer bulan lalu
       */
      previous: number;
      /**
       * "up" / "down" / "stable"
       */
      trend: "up" | "down" | "stable";
      /**
       * Persentase perubahan vs bulan lalu
       */
      value: number;
    };
    /**
     * Registrasi buyer baru bulan ini
     */
    registrasi_bulan_ini: number;
    /**
     * Registrasi buyer baru tahun ini
     */
    registrasi_tahun_ini: number;
    /**
     * Total semua buyer
     */
    total_buyer: number;
  };
};

// ------mutation------
type DeleteBuyerParams = BaseParams;

type DeleteBuyerResponse = BaseResponse;

type ResetPasswordBuyerParams = BaseParams;

type ResetPasswordBuyerBody = { new_password: string };

type ResetPasswordBuyerResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};

// query-key
const key = ["buyer-list", "buyer-chart", "buyer-stat"];

// data
export const dataAPIBuyer = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
    filter,
    tahun,
    bulan,
    minggu,
    tanggal_dari,
    tanggal_sampai,
  }: BuyerListRequest & BuyerDetailRequest & BuyerChartRequest): {
    list: UseApiQueryProps<BuyerListResponse>;
    show: UseApiQueryProps<BuyerDetailResponse>;
    chart: UseApiQueryProps<BuyerChartResponse>;
    stats: UseApiQueryProps<BuyerStatResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/buyer`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: ["staff-detail", id],
      endpoint: `/buyer/${id}`,
      enabled: !!id,
    },
    chart: {
      key: [
        key[1],
        { filter, tahun, bulan, minggu, tanggal_dari, tanggal_sampai },
      ],
      endpoint: `/buyer/chart`,
      searchParams: {
        filter,
        tahun,
        bulan,
        minggu,
        tanggal_dari,
        tanggal_sampai,
      },
      placeholderData: keepPreviousData,
    },
    stats: {
      key: [key[2]],
      endpoint: `/buyer/statistik`,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    delete: UseMutateConfig<DeleteBuyerResponse, undefined, DeleteBuyerParams>;
    resetPassword: UseMutateConfig<
      ResetPasswordBuyerResponse,
      ResetPasswordBuyerBody,
      ResetPasswordBuyerParams
    >;
  } => ({
    delete: {
      endpoint: "/buyer/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(
            queryClient,
            key.map((k) => [k]),
          );
      },
      onError: { title: "DELETE_BUYER" },
    },
    resetPassword: {
      endpoint: "/buyer/:id/reset-password",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "RESET_PASSWORD_BUYER" },
    },
  }),
};
