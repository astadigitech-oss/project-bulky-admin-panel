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
export type PromoListRequest = BaseParams;

export type PromoDetailRequest = BaseListParams;

// ------query------
// TODO REMEMBER: Reduce created at
export type PromoListResponse = BaseResponse & {
  data: {
    gambar: string;
    id: string;
    is_active: boolean;
    nama: string;
    updated_at: string;
  }[];
  meta: MetaPagination;
};

type PromoDetailResponse = BaseResponse & {
  data: {
    created_at: string;
    gambar: string;
    id: string;
    is_active: boolean;
    nama: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    updated_at: string;
    url_tujuan: string;
    urutan: number;
  };
};

// ------mutation------
type CreatePromoBody = FormData;

type CreatePromoResponse = BaseResponse & {
  data: {
    created_at: string;
    gambar: string;
    id: string;
    is_active: boolean;
    nama: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    updated_at: string;
    url_tujuan: string;
    urutan: number;
  };
};

type UpdatePromoParams = BaseParams;

type UpdatePromoBody = FormData;

type UpdatePromoResponse = BaseResponse & {
  data: {
    created_at: string;
    gambar: string;
    id: string;
    is_active: boolean;
    nama: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    updated_at: string;
    url_tujuan: string;
    urutan: number;
  };
};

type DeletePromoParams = BaseParams;

type DeletePromoResponse = BaseResponse;

type ChangeStatusPromoParams = BaseParams;

type ChangeStatusPromoResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};

// query-key
const key = ["promo-list", "promo-detail"];

// data
export const dataAPIPromo = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: PromoListRequest & PromoDetailRequest): {
    list: UseApiQueryProps<PromoListResponse>;
    show: UseApiQueryProps<PromoDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/banner-event-promo`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/banner-event-promo/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreatePromoResponse, CreatePromoBody>;
    update: UseMutateConfig<
      UpdatePromoResponse,
      UpdatePromoBody,
      UpdatePromoParams
    >;
    delete: UseMutateConfig<DeletePromoResponse, undefined, DeletePromoParams>;
    changeStatus: UseMutateConfig<
      ChangeStatusPromoResponse,
      undefined,
      ChangeStatusPromoParams
    >;
  } => ({
    create: {
      endpoint: "/banner-event-promo",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_PROMO" },
    },
    update: {
      endpoint: "/banner-event-promo/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_PROMO" },
    },
    delete: {
      endpoint: "/banner-event-promo/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_PROMO" },
    },
    changeStatus: {
      endpoint: "/banner-event-promo/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_PROMO" },
    },
  }),
};
