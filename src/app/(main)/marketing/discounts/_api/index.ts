import { useApiQuery } from "@/lib/query/use-query";
import { dataAPICoupon } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { CouponDetailRequest, CouponListRequest, CouponUsageRequest } from "./types";

// query
export const useGetCouponList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
  jenis_diskon,
  is_active,
  is_expired,
}: CouponListRequest) =>
  useApiQuery(
    dataAPICoupon.query({
      page,
      per_page,
      search,
      sort_by,
      order,
      jenis_diskon,
      is_active,
      is_expired,
    }).list,
  );

export const useGetCouponDetail = ({ id }: CouponDetailRequest) =>
  useApiQuery(dataAPICoupon.query({ id }).show);

export const useGetCouponUsages = ({ id, page, per_page }: CouponUsageRequest) =>
  useApiQuery(dataAPICoupon.query({ id, page, per_page }).usages);

export const useGetCouponCategorySelect = () =>
  useApiQuery(dataAPICoupon.query({}).categorySelect);

// mutation
export const useCreateCoupon = () =>
  useMutate(dataAPICoupon.mutation(useQueryClient()).create);

export const useUpdateCoupon = () =>
  useMutate(dataAPICoupon.mutation(useQueryClient()).update);

export const useDeleteCoupon = () =>
  useMutate(dataAPICoupon.mutation(useQueryClient()).delete);

export const useToggleStatusCoupon = () =>
  useMutate(dataAPICoupon.mutation(useQueryClient()).toggleStatus);

export const useGenerateCouponCode = () =>
  useMutate(dataAPICoupon.mutation(useQueryClient()).generateCode);
