import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BlogDetailRequest,
  BlogDetailResponse,
  BlogListRequest,
  BlogListResponse,
  CreateBlogBody,
  CreateBlogResponse,
  DeleteBlogParams,
  DeleteBlogResponse,
  ToggleStatusBlogParams,
  ToggleStatusBlogResponse,
  UpdateBlogBody,
  UpdateBlogParams,
  UpdateBlogResponse,
} from "./types";

const key = ["blog-list", "blog-detail"];

export const dataAPIBlog = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: BlogListRequest & BlogDetailRequest): {
    list: UseApiQueryProps<BlogListResponse>;
    show: UseApiQueryProps<BlogDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: "/blog",
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/blog/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateBlogResponse, CreateBlogBody>;
    update: UseMutateConfig<UpdateBlogResponse, UpdateBlogBody, UpdateBlogParams>;
    delete: UseMutateConfig<DeleteBlogResponse, undefined, DeleteBlogParams>;
    toggleStatus: UseMutateConfig<
      ToggleStatusBlogResponse,
      undefined,
      ToggleStatusBlogParams
    >;
  } => ({
    create: {
      endpoint: "/blog",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[1], data.data.id]]);
      },
      onError: { title: "CREATE_BLOG" },
    },
    update: {
      endpoint: "/blog/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[1], data.data.id]]);
      },
      onError: { title: "UPDATE_BLOG" },
    },
    delete: {
      endpoint: "/blog/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_BLOG" },
    },
    toggleStatus: {
      endpoint: "/blog/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }, vars) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], vars?.params?.id ?? ""],
          ]);
      },
      onError: { title: "TOGGLE_BLOG" },
    },
  }),
};
