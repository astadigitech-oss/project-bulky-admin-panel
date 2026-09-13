import axios, { AxiosError } from "axios";
import { getCookie } from "cookies-next/client";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

import { buildUrl } from "./utils";
import { QueryParams } from "./types";
import { cookiesKey } from "@/config";
import { apiUrl } from "@/config";

type UseApiQueryOptions<T> = Omit<
  UseQueryOptions<T, AxiosError, T, QueryKey>,
  "queryKey" | "queryFn"
>;

export interface UseApiQueryProps<T> extends UseApiQueryOptions<T> {
	/** Override the normal /api/panel base for APIs that use a versioned prefix. */
	baseUrl?: string;
  key: QueryKey;
  endpoint: string;
  params?: QueryParams;
  searchParams?: Record<
    string,
    string | number | boolean | (string | number | boolean)[] | undefined
  >;
}

export function useApiQuery<T = any>({
  key,
  baseUrl = apiUrl,
  endpoint,
  params,
  searchParams,
  ...options
}: UseApiQueryProps<T>) {
  const token = getCookie(cookiesKey);

  return useQuery<T, AxiosError>({
    queryKey: key,
    queryFn: async () => {
      const urlWithParams = buildUrl(endpoint, searchParams, baseUrl);
      const res = await axios.get(urlWithParams, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return res.data as T;
    },
    ...options,
  });
}
