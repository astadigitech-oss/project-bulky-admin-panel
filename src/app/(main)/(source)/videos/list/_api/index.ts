import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIVideo } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { VideoDetailRequest, VideoListRequest } from "./types";

export const useGetVideoList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: VideoListRequest) =>
  useApiQuery(dataAPIVideo.query({ page, per_page, search, sort_by, order }).list);

export const useGetVideoDetail = ({ id }: VideoDetailRequest) =>
  useApiQuery(dataAPIVideo.query({ id }).show);

export const useCreateVideo = () => useMutate(dataAPIVideo.mutation(useQueryClient()).create);

export const useUpdateVideo = () => useMutate(dataAPIVideo.mutation(useQueryClient()).update);

export const useDeleteVideo = () => useMutate(dataAPIVideo.mutation(useQueryClient()).delete);

export const useToggleStatusVideo = () =>
  useMutate(dataAPIVideo.mutation(useQueryClient()).toggleStatus);
