import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateVideoCategoryBody,
  CreateVideoCategoryResponse,
  DeleteVideoCategoryParams,
  DeleteVideoCategoryResponse,
  ReorderVideoCategoryBody,
  ReorderVideoCategoryParams,
  ReorderVideoCategoryResponse,
  ToggleStatusVideoCategoryParams,
  ToggleStatusVideoCategoryResponse,
  UpdateVideoCategoryBody,
  UpdateVideoCategoryParams,
  UpdateVideoCategoryResponse,
  VideoCategoryDetailRequest,
  VideoCategoryDetailResponse,
  VideoCategoryListRequest,
  VideoCategoryListResponse,
  VideoCategorySelectResponse,
} from "./types";

const key = [
  "video-category-list",
  "video-category-detail",
  "video-category-select",
];

export const dataAPIVideoCategory = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: VideoCategoryListRequest & VideoCategoryDetailRequest): {
    list: UseApiQueryProps<VideoCategoryListResponse>;
    show: UseApiQueryProps<VideoCategoryDetailResponse>;
    select: UseApiQueryProps<VideoCategorySelectResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: "/kategori-video",
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/kategori-video/${id}`,
      enabled: !!id,
    },
    select: {
      key: [key[2]],
      endpoint: "/kategori-video/dropdown",
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<
      CreateVideoCategoryResponse,
      CreateVideoCategoryBody
    >;
    update: UseMutateConfig<
      UpdateVideoCategoryResponse,
      UpdateVideoCategoryBody,
      UpdateVideoCategoryParams
    >;
    delete: UseMutateConfig<
      DeleteVideoCategoryResponse,
      undefined,
      DeleteVideoCategoryParams
    >;
    toggleStatus: UseMutateConfig<
      ToggleStatusVideoCategoryResponse,
      undefined,
      ToggleStatusVideoCategoryParams
    >;
    reorder: UseMutateConfig<
      ReorderVideoCategoryResponse,
      ReorderVideoCategoryBody,
      ReorderVideoCategoryParams
    >;
  } => ({
    create: {
      endpoint: "/kategori-video",
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
      onError: { title: "CREATE_VIDEO_CATEGORY" },
    },
    update: {
      endpoint: "/kategori-video/:id",
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
      onError: { title: "UPDATE_VIDEO_CATEGORY" },
    },
    delete: {
      endpoint: "/kategori-video/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[2]]]);
      },
      onError: { title: "DELETE_VIDEO_CATEGORY" },
    },
    toggleStatus: {
      endpoint: "/kategori-video/:id/toggle-status",
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
      onError: { title: "TOGGLE_VIDEO_CATEGORY" },
    },
    reorder: {
      endpoint: "/kategori-video/:id/reorder",
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
      onError: { title: "REORDER_VIDEO_CATEGORY" },
    },
  }),
};
