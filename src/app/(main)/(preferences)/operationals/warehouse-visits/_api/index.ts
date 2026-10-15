import { useApiQuery } from "@/lib/query/use-query";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPIWarehouseVisits } from "./data";
import {
  WarehouseVisitBookingsRequest,
  WarehouseVisitDatesRequest,
} from "./types";

export const useGetWarehouseVisitData = (
  dates: WarehouseVisitDatesRequest,
  bookings: WarehouseVisitBookingsRequest,
  includeBookings = true,
  includeDates = true,
) => {
  const queries = dataAPIWarehouseVisits.query(dates, bookings);
  return {
    dates: useApiQuery({
      ...queries.dates,
      enabled: includeDates,
    }),
    bookings: useApiQuery({
      ...queries.bookings,
      enabled: includeBookings,
    }),
  };
};

export const useWarehouseVisitMutations = () => {
  const mutations = dataAPIWarehouseVisits.mutation(useQueryClient());
  return {
    createDate: useMutate(mutations.createDate),
    updateDate: useMutate(mutations.updateDate),
    deleteDate: useMutate(mutations.deleteDate),
    reschedule: useMutate(mutations.reschedule),
    cancel: useMutate(mutations.cancel),
    attendance: useMutate(mutations.attendance),
  };
};
