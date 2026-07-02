// src/lib/query/error-response.ts
import { toast } from "sonner";
import { ErrorResposeType } from "./types";

/**
 * Handles error response and shows a toast notification.
 */
export const errorResponse = ({ err, title }: ErrorResposeType) => {
  const status = err?.response?.status;
  const message =
    (err?.response?.data as any)?.message ??
    err?.message ??
    "Terjadi kesalahan, silakan coba lagi";
  toast.error(status ? `[${status}] ${message}` : message);
  console.log(`ERROR_${title}:`, err);
};
