import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIPersetujuanSyaratLelang } from "./data";
import {
  PersetujuanSyaratLelangDetailRequest,
  PersetujuanSyaratLelangListRequest,
} from "./types";

export const useGetPersetujuanSyaratLelangList = (
  params: PersetujuanSyaratLelangListRequest & { enabled?: boolean },
) => {
  const { enabled, ...rest } = params;
  return useApiQuery({ ...dataAPIPersetujuanSyaratLelang.query(rest).list, enabled });
};

export const useGetPersetujuanSyaratLelangDetail = ({ id }: PersetujuanSyaratLelangDetailRequest) =>
  useApiQuery(dataAPIPersetujuanSyaratLelang.query({ id }).show);
