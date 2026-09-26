import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData } from "@tanstack/react-query";
import {
  PersetujuanSyaratLelangDetailRequest,
  PersetujuanSyaratLelangDetailResponse,
  PersetujuanSyaratLelangListRequest,
  PersetujuanSyaratLelangListResponse,
} from "./types";

const key = ["persetujuan-syarat-lelang-list", "persetujuan-syarat-lelang-detail"];

export const dataAPIPersetujuanSyaratLelang = {
  query: ({ id, page, per_page, search, sort_by, order }: PersetujuanSyaratLelangListRequest & PersetujuanSyaratLelangDetailRequest): {
    list: UseApiQueryProps<PersetujuanSyaratLelangListResponse>;
    show: UseApiQueryProps<PersetujuanSyaratLelangDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: "/persetujuan-syarat-ketentuan-lelang",
      searchParams: {
        page: page ?? 1,
        per_page: per_page ?? 10,
        search: search || undefined,
        sort_by,
        order,
      },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/persetujuan-syarat-ketentuan-lelang/${id}`,
      enabled: !!id,
    },
  }),
};
