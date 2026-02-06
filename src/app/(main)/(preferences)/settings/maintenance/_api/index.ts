import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIMaintenance } from "./data";
import { MaintenanceDetailRequest, MaintenanceListRequest } from "./types";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetMaintenanceList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: MaintenanceListRequest) =>
  useApiQuery(
    dataAPIMaintenance.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetMaintenanceDetail = ({ id }: MaintenanceDetailRequest) =>
  useApiQuery(dataAPIMaintenance.query({ id }).show);

// mutation
export const useCreateMaintenance = () =>
  useMutate(dataAPIMaintenance.mutation(useQueryClient()).create);
export const useUpdateMaintenance = () =>
  useMutate(dataAPIMaintenance.mutation(useQueryClient()).update);
export const useDeleteMaintenance = () =>
  useMutate(dataAPIMaintenance.mutation(useQueryClient()).delete);
export const useActivateMaintenance = () =>
  useMutate(dataAPIMaintenance.mutation(useQueryClient()).activate);
export const useDeactivateMaintenance = () =>
  useMutate(dataAPIMaintenance.mutation(useQueryClient()).deactivate);
