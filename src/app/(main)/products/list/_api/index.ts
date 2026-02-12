import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIProduct } from "./data";
import { ProductListRequest } from "./types";

export const useGetProductList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: ProductListRequest) =>
  useApiQuery(
    dataAPIProduct.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
