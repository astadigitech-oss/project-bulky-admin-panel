import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIDelivereeVehicle } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import {
  DelivereeVehicleDetailRequest,
  DelivereeVehicleListRequest,
} from "./types";

// query
export const useGetDelivereeVehicleList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
  environment,
}: DelivereeVehicleListRequest) =>
  useApiQuery(
    dataAPIDelivereeVehicle.query({
      page,
      per_page,
      search,
      sort_by,
      order,
      environment,
    }).list,
  );
export const useGetDelivereeVehicleDetail = ({
  id,
}: DelivereeVehicleDetailRequest) =>
  useApiQuery(dataAPIDelivereeVehicle.query({ id }).show);

// mutation
export const useUpdateDelivereeVehicle = () =>
  useMutate(dataAPIDelivereeVehicle.mutation(useQueryClient()).update);
export const useSyncDelivereeVehicle = () =>
  useMutate(dataAPIDelivereeVehicle.mutation(useQueryClient()).sync);
