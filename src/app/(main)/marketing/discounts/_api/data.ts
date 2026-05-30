import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CouponCategorySelectResponse,
  CouponDetailRequest,
  CouponDetailResponse,
  CouponListRequest,
  CouponListResponse,
  CouponUsageRequest,
  CouponUsagesResponse,
  CreateCouponBody,
  CreateCouponResponse,
  DeleteCouponParams,
  DeleteCouponResponse,
  GenerateCouponCodeBody,
  GenerateCouponCodeResponse,
  ToggleStatusCouponParams,
  ToggleStatusCouponResponse,
  UpdateCouponBody,
  UpdateCouponParams,
  UpdateCouponResponse,
} from "./types";

const key = [
  "coupon-list",
  "coupon-detail",
  "coupon-category-select",
  "coupon-usages",
];

export const dataAPICoupon = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
    jenis_diskon,
    is_active,
    is_expired,
  }: CouponListRequest & CouponDetailRequest & CouponUsageRequest): {
    list: UseApiQueryProps<CouponListResponse>;
    show: UseApiQueryProps<CouponDetailResponse>;
    usages: UseApiQueryProps<CouponUsagesResponse>;
    categorySelect: UseApiQueryProps<CouponCategorySelectResponse>;
  } => ({
    list: {
      key: [
        key[0],
        {
          page,
          per_page,
          search,
          sort_by,
          order,
          jenis_diskon,
          is_active,
          is_expired,
        },
      ],
      endpoint: "/kupon",
      searchParams: {
        page,
        per_page,
        search,
        sort_by,
        order,
        jenis_diskon,
        is_active,
        is_expired,
      },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/kupon/${id}`,
      enabled: !!id,
    },
    usages: {
      key: [key[3], { id, page, per_page }],
      endpoint: `/kupon/${id}/usages`,
      enabled: !!id,
      searchParams: { page, per_page },
      placeholderData: keepPreviousData,
    },
    categorySelect: {
      key: [key[2]],
      endpoint: "/kupon/dropdown/kategori",
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateCouponResponse, CreateCouponBody>;
    update: UseMutateConfig<UpdateCouponResponse, UpdateCouponBody, UpdateCouponParams>;
    delete: UseMutateConfig<DeleteCouponResponse, undefined, DeleteCouponParams>;
    toggleStatus: UseMutateConfig<
      ToggleStatusCouponResponse,
      undefined,
      ToggleStatusCouponParams
    >;
    generateCode: UseMutateConfig<
      GenerateCouponCodeResponse,
      GenerateCouponCodeBody
    >;
  } => ({
    create: {
      endpoint: "/kupon",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[2]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_COUPON" },
    },
    update: {
      endpoint: "/kupon/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[2]],
            [key[1], data.data.id],
            [key[3]],
          ]);
      },
      onError: { title: "UPDATE_COUPON" },
    },
    delete: {
      endpoint: "/kupon/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]], [key[2]]]);
      },
      onError: { title: "DELETE_COUPON" },
    },
    toggleStatus: {
      endpoint: "/kupon/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
            [key[3]],
          ]);
      },
      onError: { title: "TOGGLE_STATUS_COUPON" },
    },
    generateCode: {
      endpoint: "/kupon/generate-kode",
      method: "post",
      onSuccess: ({ data }) => {
        toast.success(`${data.message}: ${data.data.kode}`);
      },
      onError: { title: "GENERATE_CODE_COUPON" },
    },
  }),
};
