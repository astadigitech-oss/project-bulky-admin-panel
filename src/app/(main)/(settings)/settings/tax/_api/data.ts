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
type TaxBaseType = {
  created_at: string;
  id: string;
  updated_at: string;
};
type TaxBodyType = {
  is_active: boolean;
  persentase: number | number;
};

export type TaxListRequest = BaseListParams;
export type TaxDetailRequest = BaseParams;

// ------query------
export type TaxListResponse = BaseResponse & {
  data: (TaxBodyType & TaxBaseType)[];
  meta: MetaPagination;
};
export type TaxDetailResponse = BaseResponse & {
  data: TaxBodyType & TaxBaseType;
};

// ------mutation------
export type CreateTaxBody = TaxBodyType;

type CreateTaxResponse = BaseResponse & {
  data: TaxBodyType & TaxBaseType;
};

type UpdateTaxParams = BaseParams;

export type UpdateTaxBody = TaxBodyType;

type UpdateTaxResponse = BaseResponse & {
  data: TaxBodyType & TaxBaseType;
};

type DeleteTaxParams = BaseParams;

type DeleteTaxResponse = BaseResponse;

type ChangeStatusTaxParams = BaseParams;

type ChangeStatusTaxResponse = BaseResponse & {
  data: TaxBodyType & TaxBaseType;
};

// query-key
const key = ["ppn-list", "ppn-detail"];

// data
export const dataAPITaxes = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: TaxListRequest & TaxDetailRequest): {
    list: UseApiQueryProps<TaxListResponse>;
    detail: UseApiQueryProps<TaxDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/ppn`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    detail: {
      key: [key[1], id],
      endpoint: `/ppn/${id}`,
      enabled: !!id,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateTaxResponse, CreateTaxBody>;
    update: UseMutateConfig<UpdateTaxResponse, UpdateTaxBody, UpdateTaxParams>;
    delete: UseMutateConfig<DeleteTaxResponse, undefined, DeleteTaxParams>;
    changeStatus: UseMutateConfig<
      ChangeStatusTaxResponse,
      undefined,
      ChangeStatusTaxParams
    >;
  } => ({
    create: {
      endpoint: "/ppn",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_PPN" },
    },
    update: {
      endpoint: "/ppn/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_PPN" },
    },
    delete: {
      endpoint: "/ppn/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_PPN" },
    },
    changeStatus: {
      endpoint: "/ppn/:id/set-active",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_PPN" },
    },
  }),
};
