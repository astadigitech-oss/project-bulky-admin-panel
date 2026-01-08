import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { BaseResponse } from "@/lib/types";
import { QueryClient } from "@tanstack/react-query";
import { setCookie } from "cookies-next/client";
import { toast } from "sonner";

// type
type LoginBody = {
  email: string;
  password: string;
};

type LoginResponse = BaseResponse & {
  data: {
    access_token: string;
    user: {
      email: string;
      id: string;
      nama: string;
    };
  };
};

// data
export const dataAPILogin = {
  mutation: (
    queryClient: QueryClient,
  ): { login: UseMutateConfig<LoginResponse, LoginBody> } => ({
    login: {
      endpoint: "/auth/login",
      method: "post",
      isPublic: true,
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        setCookie("ACCESS_TOKEN", data.data.access_token);
        await invalidateQuery(queryClient, [["me"]]);
      },
      onError: { title: "LOGIN" },
    },
  }),
};
