import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData } from "@tanstack/react-query";
import {
  ActivityLogDetailRequest,
  ActivityLogDetailResponse,
  ActivityLogListRequest,
  ActivityLogListResponse,
} from "./types";

const key = ["activity-log-list", "activity-log-detail"];

export const dataAPIActivityLog = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: ActivityLogListRequest & ActivityLogDetailRequest): {
    list: UseApiQueryProps<ActivityLogListResponse>;
    show: UseApiQueryProps<ActivityLogDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: "/activity-log",
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/activity-log/${id}`,
      enabled: !!id,
    },
  }),
};
