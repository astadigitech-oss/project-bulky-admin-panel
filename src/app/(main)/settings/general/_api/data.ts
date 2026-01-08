import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { BaseResponse } from "@/lib/types";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// types
type UpdateProfileBody = {
  email: string;
  nama: string;
};

type UpdateProfileResponse = BaseResponse & {
  id: string;
  nama: string;
  email: string;
};

type ChangePasswordBody = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

type ChangePasswordResponse = BaseResponse;

// data
export const dataAPIAccount = {
  mutation: (
    queryClient?: QueryClient,
  ): {
    updateProfile: UseMutateConfig<UpdateProfileResponse, UpdateProfileBody>;
    changePassword: UseMutateConfig<ChangePasswordResponse, ChangePasswordBody>;
  } => ({
    updateProfile: {
      endpoint: "/auth/profile",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [["me"]]);
      },
      onError: { title: "UPDATE_PROFILE" },
    },
    changePassword: {
      endpoint: "/auth/change-password",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "CHANGE_PASSWORD" },
    },
  }),
};
