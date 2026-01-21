import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PackageConditionDetailRequest,
  PackageConditionDetailResponse,
  PackageConditionListRequest,
  PackageConditionListResponse,
  ChangeStatusPackageConditionParams,
  ChangeStatusPackageConditionResponse,
  CreatePackageConditionBody,
  CreatePackageConditionResponse,
  DeletePackageConditionParams,
  DeletePackageConditionResponse,
  UpdatePackageConditionBody,
  UpdatePackageConditionParams,
  UpdatePackageConditionResponse,
  ReorderPackageConditionResponse,
  ReorderPackageConditionParams,
  ReorderPackageConditionBody,
} from "./types";

// query-key
const key = [
  "condition-package-product-list",
  "condition-package-product-detail",
];

// data
export const dataAPIPackageCondition = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: PackageConditionListRequest & PackageConditionDetailRequest): {
    list: UseApiQueryProps<PackageConditionListResponse>;
    show: UseApiQueryProps<PackageConditionDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/kondisi-paket`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/kondisi-paket/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<
      CreatePackageConditionResponse,
      CreatePackageConditionBody
    >;
    update: UseMutateConfig<
      UpdatePackageConditionResponse,
      UpdatePackageConditionBody,
      UpdatePackageConditionParams
    >;
    delete: UseMutateConfig<
      DeletePackageConditionResponse,
      undefined,
      DeletePackageConditionParams
    >;
    changeStatus: UseMutateConfig<
      ChangeStatusPackageConditionResponse,
      undefined,
      ChangeStatusPackageConditionParams
    >;
    reorder: UseMutateConfig<
      ReorderPackageConditionResponse,
      ReorderPackageConditionBody,
      ReorderPackageConditionParams
    >;
  } => ({
    create: {
      endpoint: "/kondisi-paket",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_PACKAGE_CONDITION" },
    },
    update: {
      endpoint: "/kondisi-paket/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_PACKAGE_CONDITION" },
    },
    delete: {
      endpoint: "/kondisi-paket/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_PACKAGE_CONDITION" },
    },
    changeStatus: {
      endpoint: "/kondisi-paket/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_PACKAGE_CONDITION" },
    },
    reorder: {
      endpoint: "/kondisi-paket/:id/reorder",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.item.id],
            [key[1], data.data.swapped_with.id],
          ]);
      },
      onError: { title: "REORDER_PACKAGE_CONDITION" },
    },
  }),
};
