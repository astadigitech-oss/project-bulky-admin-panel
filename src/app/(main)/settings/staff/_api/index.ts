import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIStaff, StaffDetailRequest, StaffListRequest } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetStaffList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: StaffListRequest) =>
  useApiQuery(
    dataAPIStaff.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetStaffDetail = ({ id }: StaffDetailRequest) =>
  useApiQuery(dataAPIStaff.query({ id }).show);
export const useGetSelectRole = () =>
  useApiQuery(dataAPIStaff.query({}).roleSelect);

// mutation
export const useCreateStaff = () =>
  useMutate(dataAPIStaff.mutation(useQueryClient()).create);
export const useUpdateStaff = () =>
  useMutate(dataAPIStaff.mutation(useQueryClient()).update);
export const useDeleteStaff = () =>
  useMutate(dataAPIStaff.mutation(useQueryClient()).delete);
export const useChangeStatusStaff = () =>
  useMutate(dataAPIStaff.mutation(useQueryClient()).changeStatus);
export const useResetPasswordStaff = () =>
  useMutate(dataAPIStaff.mutation().resetPassword);
