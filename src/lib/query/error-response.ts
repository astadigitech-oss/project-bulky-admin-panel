// src/lib/query/error-response.ts
import { toast } from "sonner";
import { ErrorResposeType } from "./types";

/**
 * Handles error response and shows a toast notification.
 */
export const errorResponse = ({ err, title }: ErrorResposeType) => {
  toast.error(`ERROR ${err?.status}: ${(err?.response?.data as any)?.message}`);
  console.log(`ERROR_${title}:`, err);
};
