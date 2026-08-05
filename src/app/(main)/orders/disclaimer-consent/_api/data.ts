import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData } from "@tanstack/react-query";
import {
  DisclaimerConsentDetailRequest,
  DisclaimerConsentDetailResponse,
  DisclaimerConsentListRequest,
  DisclaimerConsentListResponse,
} from "./types";

// query-key
const key = ["disclaimer-consent-list", "disclaimer-consent-detail"];

export const dataAPIDisclaimerConsent = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: DisclaimerConsentListRequest & DisclaimerConsentDetailRequest): {
    list: UseApiQueryProps<DisclaimerConsentListResponse>;
    show: UseApiQueryProps<DisclaimerConsentDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/disclaimer-consent`,
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
      endpoint: `/disclaimer-consent/${id}`,
      enabled: !!id,
    },
  }),
};
