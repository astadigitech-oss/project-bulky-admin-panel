import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  HeroDetailRequest,
  HeroDetailResponse,
  HeroListRequest,
  HeroListResponse,
  ChangeStatusHeroParams,
  ChangeStatusHeroResponse,
  CreateHeroBody,
  CreateHeroResponse,
  DeleteHeroParams,
  DeleteHeroResponse,
  UpdateHeroBody,
  UpdateHeroParams,
  UpdateHeroResponse,
} from "./types";

// query-key
const key = ["hero-list", "hero-detail"];

// data
export const dataAPIHero = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: HeroListRequest & HeroDetailRequest): {
    list: UseApiQueryProps<HeroListResponse>;
    show: UseApiQueryProps<HeroDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/hero-section`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/hero-section/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateHeroResponse, CreateHeroBody>;
    update: UseMutateConfig<
      UpdateHeroResponse,
      UpdateHeroBody,
      UpdateHeroParams
    >;
    delete: UseMutateConfig<DeleteHeroResponse, undefined, DeleteHeroParams>;
    changeStatus: UseMutateConfig<
      ChangeStatusHeroResponse,
      undefined,
      ChangeStatusHeroParams
    >;
  } => ({
    create: {
      endpoint: "/hero-section",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_HERO" },
    },
    update: {
      endpoint: "/hero-section/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_HERO" },
    },
    delete: {
      endpoint: "/hero-section/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_HERO" },
    },
    changeStatus: {
      endpoint: "/hero-section/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_HERO" },
    },
  }),
};
