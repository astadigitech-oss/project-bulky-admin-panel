import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  WarehouseVisitAttendanceBody,
  WarehouseVisitBookingMutationResponse,
  WarehouseVisitBookingsRequest,
  WarehouseVisitBookingsResponse,
  WarehouseVisitDateBody,
  WarehouseVisitDateMutationResponse,
  WarehouseVisitDatesRequest,
  WarehouseVisitDatesResponse,
  WarehouseVisitDateUpdateBody,
  WarehouseVisitIDParams,
  WarehouseVisitRescheduleBody,
} from "./types";

const dateKey = ["warehouse-visit-dates"];
const bookingKey = ["warehouse-visit-bookings"];
const root = "/warehouse-visits";

export const dataAPIWarehouseVisits = {
  query: (
    dates: WarehouseVisitDatesRequest,
    bookings: WarehouseVisitBookingsRequest,
  ): {
    dates: UseApiQueryProps<WarehouseVisitDatesResponse>;
    bookings: UseApiQueryProps<WarehouseVisitBookingsResponse>;
  } => ({
    dates: {
      key: [dateKey[0], dates],
      endpoint: `${root}/dates`,
      searchParams: dates,
      placeholderData: keepPreviousData,
    },
    bookings: {
      key: [bookingKey[0], bookings],
      endpoint: `${root}/bookings`,
      searchParams: bookings,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    createDate: UseMutateConfig<
      WarehouseVisitDateMutationResponse,
      WarehouseVisitDateBody
    >;
    updateDate: UseMutateConfig<
      WarehouseVisitDateMutationResponse,
      WarehouseVisitDateUpdateBody,
      WarehouseVisitIDParams
    >;
    deleteDate: UseMutateConfig<
      WarehouseVisitDateMutationResponse,
      undefined,
      WarehouseVisitIDParams
    >;
    reschedule: UseMutateConfig<
      WarehouseVisitBookingMutationResponse,
      WarehouseVisitRescheduleBody,
      WarehouseVisitIDParams
    >;
    cancel: UseMutateConfig<
      WarehouseVisitBookingMutationResponse,
      undefined,
      WarehouseVisitIDParams
    >;
    attendance: UseMutateConfig<
      WarehouseVisitBookingMutationResponse,
      WarehouseVisitAttendanceBody,
      WarehouseVisitIDParams
    >;
  } => {
    const refresh = async () => {
      if (queryClient)
        await invalidateQuery(queryClient, [dateKey, bookingKey]);
    };
    return {
      createDate: {
        endpoint: `${root}/dates`,
        method: "post",
        onSuccess: async ({ data }) => {
          toast.success(data.message);
          await refresh();
        },
        onError: { title: "CREATE_WAREHOUSE_VISIT_DATE" },
      },
      updateDate: {
        endpoint: `${root}/dates/:id`,
        method: "put",
        onSuccess: async ({ data }) => {
          toast.success(data.message);
          await refresh();
        },
        onError: { title: "UPDATE_WAREHOUSE_VISIT_DATE" },
      },
      deleteDate: {
        endpoint: `${root}/dates/:id`,
        method: "delete",
        onSuccess: async ({ data }) => {
          toast.success(data.message);
          await refresh();
        },
        onError: { title: "DELETE_WAREHOUSE_VISIT_DATE" },
      },
      reschedule: {
        endpoint: `${root}/bookings/:id/reschedule`,
        method: "patch",
        onSuccess: async ({ data }) => {
          toast.success(data.message);
          await refresh();
        },
        onError: { title: "RESCHEDULE_WAREHOUSE_VISIT_BOOKING" },
      },
      cancel: {
        endpoint: `${root}/bookings/:id/cancel`,
        method: "patch",
        onSuccess: async ({ data }) => {
          toast.success(data.message);
          await refresh();
        },
        onError: { title: "CANCEL_WAREHOUSE_VISIT_BOOKING" },
      },
      attendance: {
        endpoint: `${root}/bookings/:id/attendance`,
        method: "patch",
        onSuccess: async ({ data }) => {
          toast.success(data.message);
          await refresh();
        },
        onError: { title: "UPDATE_WAREHOUSE_VISIT_ATTENDANCE" },
      },
    };
  },
};
