"use client";

import { MetaPagination } from "@/lib/types";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";

export const usePagination = (
  pageParam: string = "p",
  limitParam: string = "limit",
) => {
  const [page, setPage] = useQueryState(
    pageParam,
    parseAsInteger.withDefault(1),
  );

  const [limit, setLimit] = useQueryState(
    limitParam,
    parseAsInteger.withDefault(10),
  );

  // State untuk menyimpan metadata dari API
  const [metaPage, setMetaPage] = useState<MetaPagination>({
    current_page: 1,
    first_page: 1,
    from: 0,
    last: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const setPaginationData = (pagination?: MetaPagination) => {
    if (!pagination) return;

    // Sinkronisasi URL query params dengan data dari API
    setPage(pagination.current_page);
    setLimit(pagination.per_page);

    // Update local state metadata
    setMetaPage(pagination);
  };

  return {
    page,
    setPage,
    limit,
    setLimit,
    metaPage,
    setPaginationData,
  };
};
