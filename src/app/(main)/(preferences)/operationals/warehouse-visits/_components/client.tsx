"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMe } from "@/components/container/_api";
import { useConfirm } from "@/hooks/use-confirm";
import { TooltipText } from "@/providers/tooltip-provider";
import { WarehouseVisitDateDialog } from "./date-form";
import { cn } from "@/lib/utils";
import {
  useGetWarehouseVisitData,
  useWarehouseVisitMutations,
} from "../_api";
import { WarehouseVisitBooking, WarehouseVisitDate } from "../_api/types";
import type { ColumnDef } from "@tanstack/react-table";
import type { MetaPagination } from "@/lib/types";

const dateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-`;
};

const getInitialRange = () => {
  const now = new Date();
  const from = `${dateInputValue(now)}01`;
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return {
    from,
    to: `${dateInputValue(now)}${String(last).padStart(2, "0")}`,
  };
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));

const statusLabel: Record<WarehouseVisitBooking["status"], string> = {
  CONFIRMED: "Terkonfirmasi",
  CANCELLED: "Dibatalkan",
  ATTENDED: "Hadir",
  NO_SHOW: "Tidak hadir",
};

const statusFilterOptions = [
  { value: "all", label: "Semua status" },
  ...Object.entries(statusLabel).map(([value, label]) => ({ value, label })),
];

type DateDialogState =
  | { mode: "create" }
  | { mode: "edit"; date: WarehouseVisitDate };

const monthRangeFor = (date: string) => {
  const [year, month] = date.split("-");
  const lastDay = new Date(Date.UTC(Number(year), Number(month), 0))
    .getUTCDate()
    .toString()
    .padStart(2, "0");
  return { from: `${year}-${month}-01`, to: `${year}-${month}-${lastDay}` };
};

export const WarehouseVisitsClient = ({
  view,
  initialRange: requestedRange,
}: {
  view: "dates" | "bookings";
  initialRange?: { from: string; to: string };
}) => {
  const { data: meData } = useMe();
  const canManageVisit =
    meData?.data?.permissions?.includes("warehouse_visit:manage") ?? false;
  const defaultRange = useMemo(() => getInitialRange(), []);
  const initialDateRange = requestedRange ?? defaultRange;
  const [appliedDateRange, setAppliedDateRange] = useState(initialDateRange);
  const [draftDateRange, setDraftDateRange] = useState(initialDateRange);
  const [status, setStatus] = useState("");
  const isDateRangeDirty =
    draftDateRange.from !== appliedDateRange.from ||
    draftDateRange.to !== appliedDateRange.to;
  const isFiltersDefault =
    appliedDateRange.from === defaultRange.from &&
    appliedDateRange.to === defaultRange.to &&
    draftDateRange.from === defaultRange.from &&
    draftDateRange.to === defaultRange.to &&
    status === "";
  const isDateRangeValid =
    Boolean(draftDateRange.from && draftDateRange.to) &&
    draftDateRange.from <= draftDateRange.to;
  const { page, limit, setPage, setLimit } = usePagination();
  const [dateDialog, setDateDialog] = useState<DateDialogState | null>(null);
  const [targetDateByBooking, setTargetDateByBooking] = useState<
    Record<string, string>
  >({});
  const { dates: datesQuery, bookings: bookingsQuery } =
    useGetWarehouseVisitData(
      appliedDateRange,
      { ...appliedDateRange, status, page, per_page: limit },
      view === "bookings",
    );
  const mutations = useWarehouseVisitMutations();
  const [DialogCancel, confirmCancel] = useConfirm(
    "Batalkan booking?",
    "Pembatalan akan melepaskan kapasitas tanggal ini.",
    "destructive",
  );
  const [DialogDeleteSchedule, confirmDeleteSchedule] = useConfirm(
    "Hapus [jadwal]?",
    "Jadwal akan dihapus permanen. Jadwal yang memiliki riwayat booking tidak dapat dihapus.",
    "destructive",
  );
  const [DialogAttendance, confirmAttendance] = useConfirm(
    "Tandai [status]?",
    "Status kehadiran booking akan disimpan.",
  );

  const dates = datesQuery.data?.data ?? [];
  const bookings = bookingsQuery.data?.data ?? [];
  const datesLastPage = Math.max(1, Math.ceil(dates.length / limit));
  const currentDatesPage = Math.max(1, Math.min(page, datesLastPage));
  const datesStartIndex = (currentDatesPage - 1) * limit;
  const paginatedDates = dates.slice(datesStartIndex, datesStartIndex + limit);
  const datesPagination: MetaPagination = {
    current_page: currentDatesPage,
    first_page: 1,
    from: dates.length === 0 ? 0 : datesStartIndex + 1,
    last: dates.length,
    last_page: datesLastPage,
    per_page: limit,
    total: dates.length,
  };
  const bookingsPagination: MetaPagination = bookingsQuery.data?.meta ?? {
    current_page: page,
    first_page: 1,
    from: 0,
    last: 0,
    last_page: 1,
    per_page: limit,
    total: 0,
  };
  const openDatesWithCapacity = dates.filter(
    (item) => item.is_open && item.remaining_capacity > 0,
  );
  const cancelBooking = async (item: WarehouseVisitBooking) => {
    const confirmed = await confirmCancel(
      item.buyer_name || "Booking",
      "booking",
    );
    if (confirmed !== true) return;
    mutations.cancel.mutate({ params: { id: item.id } });
  };

  const deleteSchedule = async (item: WarehouseVisitDate) => {
    if (item.booked_count > 0) return;
    const confirmed = await confirmDeleteSchedule(
      formatDate(item.visit_date),
      "jadwal",
    );
    if (confirmed !== true) return;
    mutations.deleteDate.mutate({ params: { id: item.id } });
  };

  const setAttendance = async (
    item: WarehouseVisitBooking,
    attendance: "ATTENDED" | "NO_SHOW",
  ) => {
    const label = attendance === "ATTENDED" ? "hadir" : "tidak hadir";
    const confirmed = await confirmAttendance(label, "status");
    if (confirmed !== true) return;
    mutations.attendance.mutate({
      params: { id: item.id },
      body: { status: attendance },
    });
  };

  const reschedule = (item: WarehouseVisitBooking) => {
    const visitDateID = targetDateByBooking[item.id];
    if (!visitDateID) return;
    mutations.reschedule.mutate({
      params: { id: item.id },
      body: { visit_date_id: visitDateID },
    });
  };


  const isChangingBooking =
    mutations.reschedule.isPending ||
    mutations.cancel.isPending ||
    mutations.attendance.isPending;
  const changePageLimit = (nextLimit: number) => {
    setPage(1);
    setLimit(nextLimit);
  };
  const applyDateRange = () => {
    if (!isDateRangeValid) return;
    setAppliedDateRange(draftDateRange);
    setPage(1);
  };
  const resetDateRange = () => {
    setDraftDateRange(defaultRange);
    setAppliedDateRange(defaultRange);
    setStatus("");
    setPage(1);
  };

  useEffect(() => {
    if (view === "dates" && page > datesLastPage) setPage(datesLastPage);
  }, [datesLastPage, page, setPage, view]);

  useEffect(() => {
    const meta = bookingsQuery.data?.meta;
    if (
      view === "bookings" &&
      meta &&
      !bookingsQuery.isPlaceholderData &&
      page > meta.last_page
    ) {
      setPage(meta.last_page);
    }
  }, [bookingsQuery.data, bookingsQuery.isPlaceholderData, page, setPage, view]);

  const dateColumns: ColumnDef<WarehouseVisitDate>[] = [
    {
      accessorKey: "visit_date",
      header: "Tanggal",
      cell: ({ row }) => formatDate(row.original.visit_date),
    },
    {
      accessorKey: "is_open",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            row.original.is_open
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          )}
        >
          {row.original.is_open ? "Dibuka" : "Ditutup"}
        </span>
      ),
    },
    {
      id: "capacity",
      header: "Crew / kapasitas",
      cell: ({ row }) =>
        `${row.original.crew_count} crew · ${row.original.capacity} buyer`,
    },
    {
      id: "booked_capacity",
      header: "Terisi / sisa",
      cell: ({ row }) =>
        `${row.original.booked_count} terisi · ${row.original.remaining_capacity} sisa`,
    },
    {
      accessorKey: "visit_hours_note",
      header: "Catatan jam",
      cell: ({ row }) =>
        row.original.visit_hours_note || row.original.display_hours || "—",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const item = row.original;
        return canManageVisit ? (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={mutations.deleteDate.isPending}
                className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
                aria-label={`Buka aksi jadwal ${formatDate(item.visit_date)}`}
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                  <DropdownMenuItem
                    className="text-xs"
                    onClick={() =>
                      setDateDialog({ mode: "edit", date: item })
                    }
                  >
                    <Pencil className="size-3.5" />
                    Ubah
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs"
                    variant="destructive"
                    disabled={
                      item.booked_count > 0 || mutations.deleteDate.isPending
                    }
                    title={
                      item.booked_count > 0
                        ? "Jadwal yang memiliki booking aktif tidak dapat dihapus"
                        : undefined
                    }
                    onClick={() => void deleteSchedule(item)}
                  >
                    <Trash2 className="size-3.5" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          "—"
        );
      },
    },
  ];

  const bookingColumns: ColumnDef<WarehouseVisitBooking>[] = [
    {
      accessorKey: "visit_date",
      header: "Tanggal",
      cell: ({ row }) => formatDate(row.original.visit_date),
    },
    {
      accessorKey: "buyer_name",
      header: "Buyer",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.buyer_name}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.buyer_email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "buyer_phone",
      header: "Kontak",
      cell: ({ row }) => row.original.buyer_phone || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
          {statusLabel[row.original.status]}
        </span>
      ),
    },
    {
      id: "reschedule",
      header: "Pindahkan ke",
      cell: ({ row }) => {
        const item = row.original;
        return !canManageVisit ? (
          "—"
        ) : item.status === "CONFIRMED" ? (
          <div className="flex items-center gap-2">
            <Select
              value={targetDateByBooking[item.id] || null}
              onValueChange={(value) =>
                setTargetDateByBooking((current) => ({
                  ...current,
                  [item.id]: value ?? "",
                }))
              }
            >
              <SelectTrigger
                className="w-44 min-w-44 text-xs"
                aria-label={`Pilih tanggal tujuan untuk ${item.buyer_name}`}
              >
                <SelectValue placeholder="Pilih tanggal tujuan" />
              </SelectTrigger>
              <SelectContent>
                {openDatesWithCapacity
                  .filter((date) => date.id !== item.visit_date_id)
                  .map((date) => (
                    <SelectItem key={date.id} value={date.id}>
                      {formatDate(date.visit_date)} · {date.remaining_capacity} sisa
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              disabled={isChangingBooking || !targetDateByBooking[item.id]}
              onClick={() => reschedule(item)}
            >
              Pindahkan
            </Button>
          </div>
        ) : (
          "—"
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const item = row.original;
        return !canManageVisit ? (
          "—"
        ) : item.status === "CONFIRMED" ? (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isChangingBooking}
                className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
                aria-label={`Buka aksi reservasi ${item.buyer_name}`}
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                  <DropdownMenuItem
                    className="text-xs"
                    disabled={isChangingBooking}
                    onClick={() => void setAttendance(item, "ATTENDED")}
                  >
                    <Check className="size-3.5" />
                    Hadir
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs"
                    disabled={isChangingBooking}
                    onClick={() => void setAttendance(item, "NO_SHOW")}
                  >
                    <Users className="size-3.5" />
                    No-show
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs"
                    variant="destructive"
                    disabled={isChangingBooking}
                    onClick={() => void cancelBooking(item)}
                  >
                    <XCircle className="size-3.5" />
                    Batalkan
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <span className="text-right text-xs text-muted-foreground">
            Selesai
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogCancel />
      <DialogDeleteSchedule />
      <DialogAttendance />
      {dateDialog && (
        <WarehouseVisitDateDialog
          key={dateDialog.mode === "edit" ? dateDialog.date.id : "create"}
          open
          onOpenChange={(open) => {
            if (!open) setDateDialog(null);
          }}
          onSaved={(date) => {
            const range = monthRangeFor(date);
            setDraftDateRange(range);
            setAppliedDateRange(range);
            setPage(1);
          }}
          mode={dateDialog.mode}
          visitDate={dateDialog.mode === "edit" ? dateDialog.date : undefined}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="leading-none font-semibold text-2xl">
            {view === "dates" ? "Jadwal Kunjungan" : "Reservasi Kunjungan Gudang"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {view === "dates"
              ? "Kelola tanggal kunjungan, kapasitas crew, dan jam operasional gudang."
              : "Pantau reservasi buyer, status kehadiran, dan pemindahan tanggal kunjungan."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-xs text-muted-foreground">
            Dari
            <Input
              type="date"
              value={draftDateRange.from}
              onChange={(event) =>
                setDraftDateRange((current) => ({
                  ...current,
                  from: event.target.value,
                }))
              }
              aria-invalid={!isDateRangeValid}
              className="w-36 text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            Sampai
            <Input
              type="date"
              value={draftDateRange.to}
              onChange={(event) =>
                setDraftDateRange((current) => ({
                  ...current,
                  to: event.target.value,
                }))
              }
              aria-invalid={!isDateRangeValid}
              className="w-36 text-foreground"
            />
          </label>
          {!isFiltersDefault && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={
                  datesQuery.isFetching ||
                  (view === "bookings" && bookingsQuery.isFetching)
                }
                onClick={resetDateRange}
              >
                Reset
              </Button>
              {isDateRangeDirty && (
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    !isDateRangeValid ||
                    datesQuery.isFetching ||
                    (view === "bookings" && bookingsQuery.isFetching)
                  }
                  onClick={applyDateRange}
                >
                  Terapkan
                </Button>
              )}
            </div>
          )}
          {view === "bookings" && (
            <label className="grid gap-1 text-xs text-muted-foreground">
              Status
              <Select
                items={statusFilterOptions}
                value={status || "all"}
                onValueChange={(value) => {
                  setStatus(value === "all" ? "" : value ?? "");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusFilterOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )}
          <TooltipText
            value="Perbarui Data"
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label={
                  view === "dates" ? "Muat ulang jadwal" : "Muat ulang reservasi"
                }
                disabled={
                  datesQuery.isFetching ||
                  (view === "bookings" && bookingsQuery.isFetching)
                }
                onClick={() => {
                  void datesQuery.refetch();
                  if (view === "bookings") void bookingsQuery.refetch();
                }}
              >
                <RefreshCw
                  className={cn(
                    "size-3.5",
                    (datesQuery.isRefetching || bookingsQuery.isRefetching) &&
                      "animate-spin",
                  )}
                />
              </Button>
            }
          />
          {view === "dates" && canManageVisit && (
            <Button
              className="text-xs"
              onClick={() => setDateDialog({ mode: "create" })}
            >
              <Plus className="size-3.5" />
              Tambah jadwal
            </Button>
          )}
        </div>
      </div>

      {view === "dates" && (
        <div className="flex flex-col gap-4">
          <DataTable
            columns={dateColumns}
            data={paginatedDates}
            isInitialLoading={datesQuery.isLoading}
          />
          <Pagination
            pagination={datesPagination}
            setPage={setPage}
            setLimit={changePageLimit}
            disabled={datesQuery.isFetching}
          />
        </div>
      )}

      {view === "bookings" && (
        <div className="flex flex-col gap-4">
          <DataTable
            columns={bookingColumns}
            data={bookings}
            isInitialLoading={bookingsQuery.isLoading}
          />
          <Pagination
            pagination={bookingsPagination}
            setPage={setPage}
            setLimit={changePageLimit}
            disabled={bookingsQuery.isFetching}
          />
        </div>
      )}

    </div>
  );
};
