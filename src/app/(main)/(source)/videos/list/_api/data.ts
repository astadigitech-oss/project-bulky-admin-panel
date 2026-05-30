import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateVideoBody,
  CreateVideoResponse,
  DeleteVideoParams,
  DeleteVideoResponse,
  ToggleStatusVideoParams,
  ToggleStatusVideoResponse,
  UpdateVideoBody,
  UpdateVideoParams,
  UpdateVideoResponse,
  VideoDetailRequest,
  VideoDetailResponse,
  VideoListRequest,
  VideoListResponse,
} from "./types";

const key = ["video-list", "video-detail"];

export const dataAPIVideo = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: VideoListRequest & VideoDetailRequest): {
    list: UseApiQueryProps<VideoListResponse>;
    show: UseApiQueryProps<VideoDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: "/video",
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/video/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateVideoResponse, CreateVideoBody>;
    update: UseMutateConfig<UpdateVideoResponse, UpdateVideoBody, UpdateVideoParams>;
    delete: UseMutateConfig<DeleteVideoResponse, undefined, DeleteVideoParams>;
    toggleStatus: UseMutateConfig<
      ToggleStatusVideoResponse,
      undefined,
      ToggleStatusVideoParams
    >;
  } => ({
    create: {
      endpoint: "/video",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[1], data.data.id]]);
      },
      onError: { title: "CREATE_VIDEO" },
    },
    update: {
      endpoint: "/video/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[1], data.data.id]]);
      },
      onError: { title: "UPDATE_VIDEO" },
    },
    delete: {
      endpoint: "/video/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_VIDEO" },
    },
    toggleStatus: {
      endpoint: "/video/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }, vars) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], vars?.params?.id ?? ""],
          ]);
      },
      onError: { title: "TOGGLE_VIDEO" },
    },
  }),
};
