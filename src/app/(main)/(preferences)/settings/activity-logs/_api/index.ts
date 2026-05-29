import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIActivityLog } from "./data";
import { ActivityLogDetailRequest, ActivityLogListRequest } from "./types";

export const useGetActivityLogList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: ActivityLogListRequest) =>
  useApiQuery(
    dataAPIActivityLog.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );

export const useGetActivityLogDetail = ({ id }: ActivityLogDetailRequest) =>
  useApiQuery(dataAPIActivityLog.query({ id }).show);
