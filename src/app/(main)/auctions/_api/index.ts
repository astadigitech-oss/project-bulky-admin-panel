import axios, { AxiosError, AxiosResponse } from "axios";
import { getCookie } from "cookies-next/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useApiQuery } from "@/lib/query/use-query";
import { errorResponse } from "@/lib/query/error-response";
import { isRecord } from "@/lib/query/utils";
import { apiUrl, cookiesKey } from "@/config";

import { dataAPIAuction } from "./data";
import {
  AuctionBidsRequest,
  AuctionBatchDetail,
  AuctionBatchSummary,
  AuctionBidDetail,
  AuctionDraftInput,
  AuctionListRequest,
  AuctionOperationBody,
  AuctionProductOption,
  AuctionProductOptionsRequest,
  AuctionPublishBody,
  AuctionWinnerBody,
  BaseResponse,
  MasterSelectItem,
  PaginatedResponse,
} from "./types";

// ============================================================
// Query hooks
// ============================================================

export const useGetAuctionList = (req: AuctionListRequest) =>
  useApiQuery<PaginatedResponse<AuctionBatchSummary>>(
    dataAPIAuction.query(req).list,
  );

export const useGetAuctionDetail = (id: string) =>
  useApiQuery<BaseResponse<AuctionBatchDetail>>(
    dataAPIAuction.query({ id }).detail,
  );

export const useGetAuctionBids = (id: string, req: AuctionBidsRequest) =>
  useApiQuery<PaginatedResponse<AuctionBidDetail>>(
    dataAPIAuction.query({ id, ...req }).bids,
  );

export const useGetAuctionProductOptions = (
  req: AuctionProductOptionsRequest,
) =>
  useApiQuery<PaginatedResponse<AuctionProductOption>>(
    dataAPIAuction.query(req).productOptions,
  );

// ============================================================
// Master select hooks (dropdown)
// ============================================================

export const useGetWarehouseSelect = () =>
  useApiQuery<BaseResponse<MasterSelectItem[]>>({
    key: ["auction-master", "warehouse"],
    endpoint: "/warehouse/dropdown",
  });

export const useGetKategoriSelect = () =>
  useApiQuery<BaseResponse<MasterSelectItem[]>>({
    key: ["auction-master", "kategori"],
    endpoint: "/kategori-produk/dropdown",
  });

export const useGetMerekSelect = () =>
  useApiQuery<BaseResponse<MasterSelectItem[]>>({
    key: ["auction-master", "merek"],
    endpoint: "/merek-produk/dropdown",
  });

export const useGetKondisiSelect = () =>
  useApiQuery<BaseResponse<MasterSelectItem[]>>({
    key: ["auction-master", "kondisi"],
    endpoint: "/kondisi-produk/dropdown",
  });

export const useGetKondisiPaketSelect = () =>
  useApiQuery<BaseResponse<MasterSelectItem[]>>({
    key: ["auction-master", "kondisi-paket"],
    endpoint: "/kondisi-paket/dropdown",
  });

export const useGetSumberSelect = () =>
  useApiQuery<BaseResponse<MasterSelectItem[]>>({
    key: ["auction-master", "sumber"],
    endpoint: "/sumber-produk/dropdown",
  });

// ============================================================
// Mutation hook dengan dukungan Idempotency-Key header
// ============================================================

type AuctionMutateConfig<
  TResponse,
  TBody,
  TParams,
> = {
  endpoint: string;
  method: "post" | "put" | "patch" | "delete";
  onSuccess?: (
    data: AxiosResponse<TResponse>,
    variables: { body?: TBody; params?: TParams },
  ) => unknown;
  onError?: { title: string };
};

const useAuctionMutate = <
  TResponse,
  TBody = undefined,
  TParams = undefined,
>({
  endpoint,
  method,
  onSuccess,
  onError,
}: AuctionMutateConfig<TResponse, TBody, TParams>) =>
  useMutation<
    AxiosResponse<TResponse>,
    AxiosError,
    { body?: TBody; params?: TParams; idempotencyKey?: string }
  >({
    mutationFn: async ({ body, params, idempotencyKey }) => {
      let url = apiUrl + endpoint;
      if (params && isRecord(params)) {
        Object.entries(params).forEach(([k, v]) => {
          url = url.replace(`:${k}`, encodeURIComponent(String(v)));
        });
      }
      const headers: Record<string, string> = {
        Authorization: `Bearer ${getCookie(cookiesKey)}`,
      };
      if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
      const axiosConfig = { headers };
      switch (method) {
        case "post":
          return axios.post(url, body, axiosConfig);
        case "put":
          return axios.put(url, body, axiosConfig);
        case "patch":
          return axios.patch(url, body, axiosConfig);
        default:
          return axios.delete(url, axiosConfig);
      }
    },
    onSuccess: (data, variables, context) => {
      if (onSuccess) onSuccess(data, variables);
    },
    onError: (err, v, c) => {
      errorResponse({ err, title: onError?.title });
    },
  });

// ============================================================
// Mutation hooks
// ============================================================

export const useCreateAuction = () => {
  const queryClient = useQueryClient();
  return useAuctionMutate<BaseResponse<AuctionBatchDetail>, AuctionDraftInput>({
    endpoint: "/auctions",
    method: "post",
    onError: { title: "CREATE_AUCTION" },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auction-list"] });
    },
  });
};

export const useUpdateAuction = () => {
  const queryClient = useQueryClient();
  return useAuctionMutate<BaseResponse<AuctionBatchDetail>, AuctionDraftInput, { id: string }>({
    endpoint: "/auctions/:id",
    method: "put",
    onError: { title: "UPDATE_AUCTION" },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["auction-list"] });
      await queryClient.invalidateQueries({
        queryKey: ["auction-detail", { id: variables.params?.id }],
      });
    },
  });
};

export const usePublishAuction = () => {
  const queryClient = useQueryClient();
  return useAuctionMutate<BaseResponse<AuctionBatchDetail>, AuctionPublishBody, { id: string }>({
    endpoint: "/auctions/:id/publish",
    method: "post",
    onError: { title: "PUBLISH_AUCTION" },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["auction-list"] });
      await queryClient.invalidateQueries({
        queryKey: ["auction-detail", { id: variables.params?.id }],
      });
    },
  });
};

export const useSelectWinner = () => {
  const queryClient = useQueryClient();
  return useAuctionMutate<BaseResponse<AuctionBatchDetail>, AuctionWinnerBody, { id: string }>({
    endpoint: "/auctions/:id/winner",
    method: "post",
    onError: { title: "SELECT_WINNER" },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["auction-list"] });
      await queryClient.invalidateQueries({
        queryKey: ["auction-detail", { id: variables.params?.id }],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auction-bids"],
      });
    },
  });
};

export const useUpdateOperations = () => {
  const queryClient = useQueryClient();
  return useAuctionMutate<BaseResponse<AuctionBatchDetail>, AuctionOperationBody, { id: string }>({
    endpoint: "/auctions/:id/operations",
    method: "patch",
    onError: { title: "UPDATE_OPERATIONS" },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["auction-list"] });
      await queryClient.invalidateQueries({
        queryKey: ["auction-detail", { id: variables.params?.id }],
      });
    },
  });
};

// ============================================================
// Upload asset (multipart FormData)
// ============================================================

export const useUploadAuctionAsset = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<BaseResponse<{ id: string; url: string }>>,
    AxiosError,
    { file: File; kind: "IMAGE" | "PDF" }
  >({
    mutationFn: async ({ file, kind }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      return axios.post(`${apiUrl}/auctions/assets`, form, {
        headers: {
          Authorization: `Bearer ${getCookie(cookiesKey)}`,
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onError: (err) => errorResponse({ err, title: "UPLOAD_ASSET" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auction-detail"] });
    },
  });
};
