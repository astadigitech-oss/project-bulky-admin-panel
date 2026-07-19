import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIDisclaimerConsent } from "./data";
import {
  DisclaimerConsentDetailRequest,
  DisclaimerConsentListRequest,
} from "./types";

// ─── Query ───────────────────────────────────────────────────────────────────

export const useGetDisclaimerConsentList = (
  params: DisclaimerConsentListRequest & { enabled?: boolean },
) => {
  const { enabled, ...rest } = params;
  return useApiQuery({ ...dataAPIDisclaimerConsent.query(rest).list, enabled });
};

export const useGetDisclaimerConsentDetail = ({
  id,
}: DisclaimerConsentDetailRequest) =>
  useApiQuery(dataAPIDisclaimerConsent.query({ id }).show);
