import { useMutate } from "@/lib/query";
import { BaseResponse } from "@/lib/types";
import { setCookie } from "cookies-next/client";
import { toast } from "sonner";

type Body = {
  email: string;
  password: string;
};

type Data = {
  access_token: string;
  user: User;
};

type User = {
  email: string;
  id: string;
  nama: string;
};

type LoginResponse = BaseResponse & {
  data: Data;
};

export const useLogin = () => {
  const mutation = useMutate<LoginResponse, Body>({
    endpoint: "/auth/login",
    method: "post",
    isPublic: true,
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      setCookie("ACCESS_TOKEN", data.data.access_token);
    },
    onError: {
      title: "LOGIN",
    },
  });

  return mutation;
};
