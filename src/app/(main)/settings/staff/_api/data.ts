import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// types
// ------partials------
type StaffType = {
  created_at: string;
  email: string;
  id: string;
  is_active: boolean;
  last_login_at: string | null;
  nama: string;
  updated_at: string;
};

export type StaffListRequest = BaseListParams;

export type StaffDetailRequest = BaseParams;

// ------query------
export type StaffListResponse = BaseResponse & {
  data: (Omit<StaffType, "updated_at"> & { role: string })[];
  meta: MetaPagination;
};

export type StaffDetailResponse = BaseResponse & { data: StaffType };

export type RoleSelectResponse = BaseResponse & {
  data: {
    created_at: string;
    deskripsi: string;
    id: string;
    is_active: boolean;
    kode: string;
    nama: string;
    updated_at: string;
  }[];
};

// ------mutation------
export type CreateStaffBody = {
  email: string;
  nama: string;
  password: string;
  confirm_password: string;
  role_id: string;
};

type CreateStaffResponse = StaffDetailResponse;

type UpdateStaffParams = BaseParams;

export type UpdateStaffBody = {
  email: string;
  is_active: boolean;
  nama: string;
};

type UpdateStaffResponse = CreateStaffResponse;

type DeleteStaffParams = UpdateStaffParams;

type DeleteStaffResponse = BaseResponse;

type ChangeStatusStaffParams = DeleteStaffParams;

type ChangeStatusStaffResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
type ResetPasswordStaffParams = DeleteStaffParams;
export type ResetPasswordStaffBody = {
  new_password: string;
  confirm_password: string;
};

type ResetPasswordStaffResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};

// query-key
const key = ["staff-list", "staff-detail"];

// data
export const dataAPIStaff = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: StaffListRequest & StaffDetailRequest): {
    list: UseApiQueryProps<StaffListResponse>;
    show: UseApiQueryProps<StaffDetailResponse>;
    roleSelect: UseApiQueryProps<RoleSelectResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/admin`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/admin/${id}`,
      enabled: !!id,
    },
    roleSelect: {
      key: ["role-select"],
      endpoint: `/role`,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateStaffResponse, CreateStaffBody>;
    update: UseMutateConfig<
      UpdateStaffResponse,
      UpdateStaffBody,
      UpdateStaffParams
    >;
    delete: UseMutateConfig<DeleteStaffResponse, undefined, DeleteStaffParams>;
    changeStatus: UseMutateConfig<
      ChangeStatusStaffResponse,
      undefined,
      ChangeStatusStaffParams
    >;
    resetPassword: UseMutateConfig<
      ResetPasswordStaffResponse,
      ResetPasswordStaffBody,
      ResetPasswordStaffParams
    >;
  } => ({
    create: {
      endpoint: "/admin",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_STAFF" },
    },
    update: {
      endpoint: "/admin/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_STAFF" },
    },
    delete: {
      endpoint: "/admin/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_STAFF" },
    },
    changeStatus: {
      endpoint: "/admin/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_STAFF" },
    },
    resetPassword: {
      endpoint: "/admin/:id/reset-password",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "RESET_PASSWORD_STAFF" },
    },
  }),
};
