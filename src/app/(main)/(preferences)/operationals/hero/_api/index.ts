import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIHero } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { HeroDetailRequest, HeroListRequest } from "./types";

// query
export const useGetHeroList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: HeroListRequest) =>
  useApiQuery(
    dataAPIHero.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetHeroDetail = ({ id }: HeroDetailRequest) =>
  useApiQuery(dataAPIHero.query({ id }).show);
export const useGetHeroSchedule = () =>
  useApiQuery(dataAPIHero.query({}).schedule);

// mutation
export const useCreateHero = () =>
  useMutate(dataAPIHero.mutation(useQueryClient()).create);
export const useUpdateHero = () =>
  useMutate(dataAPIHero.mutation(useQueryClient()).update);
export const useDeleteHero = () =>
  useMutate(dataAPIHero.mutation(useQueryClient()).delete);
export const useChangeStatusHero = () =>
  useMutate(dataAPIHero.mutation(useQueryClient()).changeStatus);
