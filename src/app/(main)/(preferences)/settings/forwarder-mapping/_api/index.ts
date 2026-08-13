import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIForwarderMapping } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetForwarderCities = ({
  page,
  per_page,
  search,
}: {
  page?: number;
  per_page?: number;
  search?: string;
}) =>
  useApiQuery(
    dataAPIForwarderMapping.query({
      cityPage: page,
      cityPerPage: per_page,
      citySearch: search,
    }).cities,
  );

export const useGetForwarderSubdistricts = ({
  page,
  per_page,
  search,
}: {
  page?: number;
  per_page?: number;
  search?: string;
}) =>
  useApiQuery(
    dataAPIForwarderMapping.query({
      subdistrictPage: page,
      subdistrictPerPage: per_page,
      subdistrictSearch: search,
    }).subdistricts,
  );

// mutation
export const useSyncForwarderMapping = () =>
  useMutate(dataAPIForwarderMapping.mutation(useQueryClient()).sync);
