import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

export type WarehouseVisitDate = {
  id: string;
  warehouse_id: string;
  visit_date: string;
  is_open: boolean;
  crew_count: number;
  capacity: number;
  booked_count: number;
  remaining_capacity: number;
  visit_hours_note?: string | null;
  display_hours?: string | null;
};

export type WarehouseVisitBooking = {
  id: string;
  visit_date_id: string;
  visit_date: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string | null;
  status: "CONFIRMED" | "CANCELLED" | "ATTENDED" | "NO_SHOW";
  created_at: string;
  updated_at: string;
};

export type WarehouseVisitDatesRequest = {
  from: string;
  to: string;
};

export type WarehouseVisitBookingsRequest = BaseListParams & {
  from: string;
  to: string;
  status?: string;
};

export type WarehouseVisitDatesResponse = BaseResponse & {
  data: WarehouseVisitDate[];
};

export type WarehouseVisitBookingsResponse = BaseResponse & {
  data: WarehouseVisitBooking[];
  meta: MetaPagination;
};

export type WarehouseVisitDateBody = {
  visit_date: string;
  is_open: boolean;
  crew_count: number;
  visit_hours_note?: string;
};

export type WarehouseVisitDateUpdateBody = Omit<
  WarehouseVisitDateBody,
  "visit_date"
>;

export type WarehouseVisitDateMutationResponse = BaseResponse & {
  data: WarehouseVisitDate;
};

export type WarehouseVisitBookingMutationResponse = BaseResponse & {
  data: WarehouseVisitBooking;
};

export type WarehouseVisitRescheduleBody = {
  visit_date_id: string;
};

export type WarehouseVisitAttendanceBody = {
  status: "ATTENDED" | "NO_SHOW";
};

export type WarehouseVisitIDParams = BaseParams & { id: string };
