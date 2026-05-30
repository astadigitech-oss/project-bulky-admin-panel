import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BlogCategoryDetailRequest,
  BlogCategoryDetailResponse,
  BlogCategoryListRequest,
  BlogCategoryListResponse,
  BlogCategorySelectResponse,
  CreateBlogCategoryBody,
  CreateBlogCategoryResponse,
  DeleteBlogCategoryParams,
  DeleteBlogCategoryResponse,
  ReorderBlogCategoryBody,
  ReorderBlogCategoryParams,
  ReorderBlogCategoryResponse,
  ToggleStatusBlogCategoryParams,
  ToggleStatusBlogCategoryResponse,
  UpdateBlogCategoryBody,
  UpdateBlogCategoryParams,
  UpdateBlogCategoryResponse,
} from "./types";

const key = ["blog-category-list", "blog-category-detail", "blog-category-select"];

export const dataAPIBlogCategory = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: BlogCategoryListRequest & BlogCategoryDetailRequest): {
    list: UseApiQueryProps<BlogCategoryListResponse>;
    show: UseApiQueryProps<BlogCategoryDetailResponse>;
    select: UseApiQueryProps<BlogCategorySelectResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: "/kategori-blog",
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/kategori-blog/${id}`,
      enabled: !!id,
    },
    select: {
      key: [key[2]],
      endpoint: "/kategori-blog/dropdown",
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateBlogCategoryResponse, CreateBlogCategoryBody>;
    update: UseMutateConfig<
      UpdateBlogCategoryResponse,
      UpdateBlogCategoryBody,
      UpdateBlogCategoryParams
    >;
    delete: UseMutateConfig<
      DeleteBlogCategoryResponse,
      undefined,
      DeleteBlogCategoryParams
    >;
    toggleStatus: UseMutateConfig<
      ToggleStatusBlogCategoryResponse,
      undefined,
      ToggleStatusBlogCategoryParams
    >;
    reorder: UseMutateConfig<
      ReorderBlogCategoryResponse,
      ReorderBlogCategoryBody,
      ReorderBlogCategoryParams
    >;
  } => ({
    create: {
      endpoint: "/kategori-blog",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[2]], [key[1], data.data.id]]);
      },
      onError: { title: "CREATE_BLOG_CATEGORY" },
    },
    update: {
      endpoint: "/kategori-blog/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[2]], [key[1], data.data.id]]);
      },
      onError: { title: "UPDATE_BLOG_CATEGORY" },
    },
    delete: {
      endpoint: "/kategori-blog/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]], [key[2]]]);
      },
      onError: { title: "DELETE_BLOG_CATEGORY" },
    },
    toggleStatus: {
      endpoint: "/kategori-blog/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }, vars) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], vars?.params?.id ?? ""],
            [key[2]],
          ]);
      },
      onError: { title: "TOGGLE_BLOG_CATEGORY" },
    },
    reorder: {
      endpoint: "/kategori-blog/:id/reorder",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.item.id],
            [key[1], data.data.swapped.id],
            [key[2]],
          ]);
      },
      onError: { title: "REORDER_BLOG_CATEGORY" },
    },
  }),
};
