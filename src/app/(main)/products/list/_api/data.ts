import { UseApiQueryProps } from "@/lib/query/use-query";
import { ProductListRequest, ProductListResponse } from "./types";
import { keepPreviousData } from "@tanstack/react-query";

const key = ["product-list"];

export const dataAPIProduct = {
  query: ({
    page,
    per_page,
    search,
    sort_by,
    order,
  }: ProductListRequest): {
    list: UseApiQueryProps<ProductListResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/produk`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
  }),
};
