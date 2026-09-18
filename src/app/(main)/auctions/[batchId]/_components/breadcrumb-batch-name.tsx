"use client";

import { useGetAuctionDetail } from "../../_api";

export const BreadcrumbBatchName = ({ batchId }: { batchId: string }) => {
  const { data } = useGetAuctionDetail(batchId);
  const name = data?.data?.nama_id;

  return <span className="max-w-48 truncate align-bottom">{name || "Batch"}</span>;
};
