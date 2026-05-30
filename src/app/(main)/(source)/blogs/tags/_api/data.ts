import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  TagBlogDetailRequest,
  TagBlogDetailResponse,
  TagBlogListRequest,
  TagBlogListResponse,
  ChangeStatusTagBlogParams,
  ChangeStatusTagBlogResponse,
  CreateTagBlogBody,
  CreateTagBlogResponse,
  DeleteTagBlogParams,
  DeleteTagBlogResponse,
  UpdateTagBlogBody,
  UpdateTagBlogParams,
  UpdateTagBlogResponse,
  ReorderTagBlogResponse,
  ReorderTagBlogParams,
  ReorderTagBlogBody,
  TagBlogSelectResponse,
} from "./types";

// query-key
const key = ["tag-blog-list", "tag-blog-detail"];

// data
export const dataAPITagBlog = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: TagBlogListRequest & TagBlogDetailRequest): {
    list: UseApiQueryProps<TagBlogListResponse>;
    show: UseApiQueryProps<TagBlogDetailResponse>;
    select: UseApiQueryProps<TagBlogSelectResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/label-blog`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/label-blog/${id}`,
      enabled: !!id,
    },
    select: {
      key: [key[2]],
      endpoint: `/label-blog/dropdown`,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateTagBlogResponse, CreateTagBlogBody>;
    update: UseMutateConfig<
      UpdateTagBlogResponse,
      UpdateTagBlogBody,
      UpdateTagBlogParams
    >;
    delete: UseMutateConfig<
      DeleteTagBlogResponse,
      undefined,
      DeleteTagBlogParams
    >;
    changeStatus: UseMutateConfig<
      ChangeStatusTagBlogResponse,
      undefined,
      ChangeStatusTagBlogParams
    >;
    reorder: UseMutateConfig<
      ReorderTagBlogResponse,
      ReorderTagBlogBody,
      ReorderTagBlogParams
    >;
  } => ({
    create: {
      endpoint: "/label-blog",
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
      onError: { title: "CREATE_PACKAGE_CONDITION" },
    },
    update: {
      endpoint: "/label-blog/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[2]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_PACKAGE_CONDITION" },
    },
    delete: {
      endpoint: "/label-blog/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[2]]]);
      },
      onError: { title: "DELETE_PACKAGE_CONDITION" },
    },
    changeStatus: {
      endpoint: "/label-blog/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[2]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_PACKAGE_CONDITION" },
    },
    reorder: {
      endpoint: "/label-blog/:id/reorder",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[2]],
            [key[1], data.data.item.id],
            [key[1], data.data.swapped.id],
          ]);
      },
      onError: { title: "REORDER_PACKAGE_CONDITION" },
    },
  }),
};
