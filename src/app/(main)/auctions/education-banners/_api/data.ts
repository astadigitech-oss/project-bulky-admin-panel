import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AuctionEducationBannerDetailResponse,
  AuctionEducationBannerListRequest,
  AuctionEducationBannerListResponse,
  AuctionEducationBannerMutationBody,
  AuctionEducationBannerMutationResponse,
  AuctionEducationBannerParams,
  AuctionEducationBannerReorderBody,
  AuctionEducationBanner,
} from "./types";

const key = [
  "auction-education-banner-list",
  "auction-education-banner-detail",
];
export const dataAPIAuctionEducationBanner = {
  query: ({
    id,
    page,
    per_page,
    search,
  }: AuctionEducationBannerListRequest & AuctionEducationBannerParams): {
    list: UseApiQueryProps<AuctionEducationBannerListResponse>;
    show: UseApiQueryProps<AuctionEducationBannerDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search }],
      endpoint: "/auction-education-banners",
      searchParams: { page, per_page, search },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/auction-education-banners/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (queryClient?: QueryClient) => {
    const action = (
      endpoint: string,
      method: "post" | "put" | "patch",
      title: string,
    ): UseMutateConfig<
      AuctionEducationBannerMutationResponse,
      AuctionEducationBannerMutationBody | undefined,
      AuctionEducationBannerParams
    > => ({
      endpoint,
      method,
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title },
    });
    const create: UseMutateConfig<
      AuctionEducationBannerMutationResponse,
      AuctionEducationBannerMutationBody
    > = {
      endpoint: "/auction-education-banners",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_AUCTION_EDUCATION_BANNER" },
    };
    const remove: UseMutateConfig<
      { success: boolean; message: string },
      undefined,
      AuctionEducationBannerParams
    > = {
      endpoint: "/auction-education-banners/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_AUCTION_EDUCATION_BANNER" },
    };
    const reorder: UseMutateConfig<
      { success: boolean; message: string; data: AuctionEducationBanner[] },
      AuctionEducationBannerReorderBody
    > = {
      endpoint: "/auction-education-banners/reorder",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "REORDER_AUCTION_EDUCATION_BANNERS" },
    };
    return {
      create,
      update: action(
        "/auction-education-banners/:id",
        "put",
        "UPDATE_AUCTION_EDUCATION_BANNER",
      ),
      publish: action(
        "/auction-education-banners/:id/publish",
        "patch",
        "PUBLISH_AUCTION_EDUCATION_BANNER",
      ),
      draft: action(
        "/auction-education-banners/:id/draft",
        "patch",
        "DRAFT_AUCTION_EDUCATION_BANNER",
      ),
      reorder,
      delete: remove,
    };
  },
};
