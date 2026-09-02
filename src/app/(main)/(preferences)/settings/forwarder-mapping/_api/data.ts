import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ForwarderCityListResponse,
  ForwarderSubdistrictListResponse,
  SyncForwarderMappingResponse,
} from "./types";

// query-key
const key = ["forwarder-city-list", "forwarder-subdistrict-list"];

// data
export const dataAPIForwarderMapping = {
  query: ({
    cityPage,
    cityPerPage,
    citySearch,
    subdistrictPage,
    subdistrictPerPage,
    subdistrictSearch,
  }: {
    cityPage?: number;
    cityPerPage?: number;
    citySearch?: string;
    subdistrictPage?: number;
    subdistrictPerPage?: number;
    subdistrictSearch?: string;
  }): {
    cities: UseApiQueryProps<ForwarderCityListResponse>;
    subdistricts: UseApiQueryProps<ForwarderSubdistrictListResponse>;
  } => ({
    cities: {
      key: [
        key[0],
        { page: cityPage, per_page: cityPerPage, search: citySearch },
      ],
      endpoint: `/forwarder-mapping/cities`,
      searchParams: {
        page: cityPage,
        per_page: cityPerPage,
        search: citySearch,
      },
      placeholderData: keepPreviousData,
    },
    subdistricts: {
      key: [
        key[1],
        { page: subdistrictPage, per_page: subdistrictPerPage, search: subdistrictSearch },
      ],
      endpoint: `/forwarder-mapping/subdistricts`,
      searchParams: {
        page: subdistrictPage,
        per_page: subdistrictPerPage,
        search: subdistrictSearch,
      },
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    sync: UseMutateConfig<SyncForwarderMappingResponse>;
  } => ({
    sync: {
      endpoint: "/forwarder-mapping/sync",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[1]]]);
      },
      onError: { title: "SYNC_FORWARDER_MAPPING" },
    },
  }),
};
