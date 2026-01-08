import { cookiesKey } from "@/config";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { BaseResponse } from "@/lib/types";
import { deleteCookie } from "cookies-next/client";
import { toast } from "sonner";

// types
type MeResponse = BaseResponse & {
  data: {
    email: string;
    id: string;
    nama: string;
    permissions: string[];
    role: { nama: string };
  };
};

type LogoutResponse = BaseResponse;

// data
export const dataAPIMe = {
  query: (): { me: UseApiQueryProps<MeResponse> } => ({
    me: {
      key: ["me"],
      endpoint: `/auth/me`,
      retry: 0,
    },
  }),
  mutation: (): { logout: UseMutateConfig<LogoutResponse> } => ({
    logout: {
      endpoint: "/auth/logout",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        deleteCookie(cookiesKey);
      },
      onError: { title: "LOGOUT" },
    },
  }),
};
