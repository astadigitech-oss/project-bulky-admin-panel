"use client";

import {
  useCancelOrder,
  useGetOrderDelivereeDetail,
  useGetOrderDetail,
  useGetOrderInvoice,
  useGetOrderTracking,
  useRetryBooking,
  useUpdateOrderStatus,
} from "@/app/(main)/orders/_api";
import type {
  OrderDetailResponse,
  UpdateOrderStatusBody,
} from "@/app/(main)/orders/_api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  MapPin,
  Package,
  Receipt,
  ShoppingCart,
  User,
  Clock,
  RefreshCw,
  Truck,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  FileText,
  Download,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const BASE_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Menunggu",
    className:
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  },
  PROCESSING: {
    label: "Diproses",
    className:
      "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  READY: {
    label: "Siap Kirim",
    className:
      "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
  },
  SHIPPED: {
    label: "Dikirim",
    className:
      "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
  },
  COMPLETED: {
    label: "Selesai",
    className:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  },
  PAID: {
    label: "Lunas",
    className:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
  UNPAID: {
    label: "Belum Bayar",
    className: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    className:
      "bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-300",
  },
  FAILED: {
    label: "Gagal",
    className: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  },
  REFUNDED: {
    label: "Dikembalikan",
    className:
      "bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-300",
  },
};

const getStatusConfig = (
  deliveryType?: string,
): Record<string, { label: string; className: string }> => {
  if (deliveryType === "PICKUP") {
    return {
      ...BASE_STATUS_CONFIG,
      READY: {
        label: "Siap Diambil",
        className: BASE_STATUS_CONFIG.READY.className,
      },
    };
  }
  return BASE_STATUS_CONFIG;
};

const DELIVERY_TYPE_LABEL: Record<string, string> = {
  PICKUP: "Ambil Sendiri",
  DELIVEREE: "Deliveree",
  FORWARDER: "Forwarder (Darat)",
  FORWARDER_LCL: "Forwarder (LCL)",
};

const formatRupiah = (val: string | number) =>
  Number(val).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

// Status berikutnya berdasarkan delivery_type
const getNextStatuses = (
  currentStatus: string,
  deliveryType: string,
): UpdateOrderStatusBody["order_status"][] => {
  const isPickup = deliveryType === "PICKUP";
  const flow: Record<string, UpdateOrderStatusBody["order_status"][]> = {
    PENDING: ["PROCESSING"],
    PROCESSING: ["READY"],
    READY: isPickup ? ["COMPLETED"] : ["SHIPPED"],
    SHIPPED: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
  };
  return flow[currentStatus] ?? [];
};

const bookingStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  NOT_APPLICABLE: {
    label: "Tidak berlaku",
    className:
      "bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-300",
  },
  PENDING: {
    label: "Menunggu",
    className:
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  },
  IN_PROGRESS: {
    label: "Sedang diproses",
    className:
      "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  BOOKED: {
    label: "Berhasil dipesan",
    className:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
  FAILED: {
    label: "Gagal",
    className: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  },
};

export const OrderDetailClient = ({ orderId }: { orderId: string }) => {
  const { data, isLoading, refetch } = useGetOrderDetail({ id: orderId });
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateOrderStatus();
  const { mutate: retryBooking, isPending: isRetrying } = useRetryBooking();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const [openDialog, setOpenDialog] = useState(false);
  const [note, setNote] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      const result = await refetch();
      const bookingStatus = result.data?.data?.shipping_info?.booking_status;
      if (bookingStatus !== "IN_PROGRESS") stopPolling();
    }, 3000);
  };

  useEffect(() => {
    const bookingStatus = data?.data?.shipping_info?.booking_status;
    if (bookingStatus === "IN_PROGRESS") {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [data?.data?.shipping_info?.booking_status]);

  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [invoiceEnabled, setInvoiceEnabled] = useState(false);
  const [delivereeDetailEnabled, setDelivereeDetailEnabled] = useState(false);
  const [delivereeDetailModalOpen, setDelivereeDetailModalOpen] = useState(false);

  const {
    data: trackingData,
    isFetching: isLoadingTracking,
    refetch: refetchTracking,
  } = useGetOrderTracking({ id: orderId, enabled: trackingEnabled });

  const {
    data: invoiceData,
    isFetching: isLoadingInvoice,
    refetch: refetchInvoice,
  } = useGetOrderInvoice({ id: orderId, enabled: invoiceEnabled });

  const {
    data: delivereeDetailData,
    isFetching: isLoadingDelivereeDetail,
    refetch: refetchDelivereeDetail,
  } = useGetOrderDelivereeDetail({ id: orderId, enabled: delivereeDetailEnabled });

  const handleUpdateStatus = (targetStatus: UpdateOrderStatusBody["order_status"]) => {
    updateStatus(
      {
        params: { id: orderId },
        body: { order_status: targetStatus, note: note || undefined },
      },
      {
        onSuccess: async () => {
          await refetch();
          setOpenDialog(false);
          setNote("");
        },
      },
    );
  };

  const handleRetryBooking = () => {
    retryBooking(
      { params: { id: orderId } },
      { onSuccess: async () => { await refetch(); } },
    );
  };

  const handleCancelOrder = () => {
    cancelOrder(
      {
        params: { id: orderId },
        body: { reason: cancelReason || undefined },
      },
      {
        onSuccess: async () => {
          await refetch();
          setOpenCancelDialog(false);
          setCancelReason("");
        },
      },
    );
  };

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Memuat detail pesanan...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Pesanan tidak ditemukan.
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.delivery_type);

  const statusOrder = statusConfig[order.order_status] ?? {
    label: order.order_status,
    className: "",
  };
  const statusPayment = statusConfig[order.payment_status] ?? {
    label: order.payment_status,
    className: "",
  };

  const nextStatuses = getNextStatuses(order.order_status, order.delivery_type);
  const alamat = order.alamat_pengiriman;

  return (
    <div className="flex flex-col gap-6">
      {/* Dialog Update Status */}
      <Dialog open={openDialog} onOpenChange={(open) => { if (!open) setNote(""); setOpenDialog(open); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Status Pesanan</DialogTitle>
          </DialogHeader>

          {/* Visualisasi transisi status */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Saat ini</span>
              <Badge className={statusOrder.className}>{statusOrder.label}</Badge>
            </div>
            <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-4" />
            {nextStatuses.map((s) => {
              const cfg = statusConfig[s] ?? { label: s, className: "" };
              return (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Berikutnya</span>
                  <Badge className={cfg.className}>{cfg.label}</Badge>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              Catatan{" "}
              <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <Textarea
              placeholder="Tambahkan catatan untuk perubahan status ini..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setNote(""); setOpenDialog(false); }}>
              Batal
            </Button>
            {nextStatuses.map((s) => (
              <Button
                key={s}
                onClick={() => handleUpdateStatus(s)}
                disabled={isUpdating}
              >
                {isUpdating && <RefreshCw className="size-3.5 animate-spin" />}
                Konfirmasi
              </Button>
            ))}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Deliveree */}
      {order.delivery_type === "DELIVEREE" && order.shipping_info.booking_id && (
        <Dialog open={delivereeDetailModalOpen} onOpenChange={setDelivereeDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="size-4" />
                Detail Deliveree
              </DialogTitle>
            </DialogHeader>

            <div className="flex justify-end -mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchDelivereeDetail()}
                disabled={isLoadingDelivereeDetail}
              >
                <RefreshCw className={`size-3.5 ${isLoadingDelivereeDetail ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {isLoadingDelivereeDetail && !delivereeDetailData && (
              <div className="text-sm text-muted-foreground text-center py-6">
                Memuat detail...
              </div>
            )}

            {delivereeDetailData?.data && (() => {
              const d = delivereeDetailData.data;
              const formatRp = (val: number) =>
                val.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });

              const deliveryStatusLabel: Record<string, string> = {
                locating_driver: "Mencari Driver",
                driver_accept_booking: "Driver Diterima",
                delivery_in_progress: "Dalam Perjalanan",
                delivery_complete: "Selesai",
                delivery_completed: "Selesai",
                canceled: "Dibatalkan",
                locating_driver_timeout: "Timeout",
              };

              const deliveryStatusClass: Record<string, string> = {
                delivery_complete: "text-emerald-600",
                canceled: "text-red-500",
                locating_driver_timeout: "text-red-500",
                delivery_in_progress: "text-blue-500",
                locating_driver: "text-yellow-500",
                driver_accept_booking: "text-blue-500",
              };

              const locationStatusClass: Record<string, string> = {
                delivered: "text-emerald-600",
                failed: "text-red-500",
              };

              return (
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[75vh] pr-1">
                  {/* ID + Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold">ID #{d.id}</span>
                    <span className={`text-sm font-medium ${deliveryStatusClass[d.status] ?? "text-muted-foreground"}`}>
                      {deliveryStatusLabel[d.status] ?? d.status}
                    </span>
                  </div>

                  {/* Info grid: 2 kolom */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Kendaraan</span>
                      <span className="font-medium">{d.vehicle_type_info.name}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Total Biaya</span>
                      <span className="font-semibold">{formatRp(d.total_fees)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Dibuat</span>
                      <span>{d.created_at ? format(new Date(d.created_at), "dd MMM yyyy, HH:mm") : "-"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Pickup</span>
                      <span>{d.pickup_time ? format(new Date(d.pickup_time), "dd MMM yyyy, HH:mm") : "-"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Selesai</span>
                      <span>{d.completed_at ? format(new Date(d.completed_at), "dd MMM yyyy, HH:mm") : "-"}</span>
                    </div>
                    {d.driver && (
                      <>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">Driver</span>
                          <span>{d.driver.name}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">Telepon Driver</span>
                          <span>{d.driver.phone}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Retry — hanya saat Deliveree cancel */}
                  {(d.status === "canceled" || d.status === "locating_driver_timeout") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                      onClick={() => {
                        setDelivereeDetailModalOpen(false);
                        retryBooking(
                          { params: { id: orderId } },
                          { onSuccess: async () => { await refetch(); } },
                        );
                      }}
                      disabled={isRetrying}
                    >
                      {isRetrying ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="size-3.5" />
                      )}
                      Booking Ulang
                    </Button>
                  )}

                  {/* Tracking URL */}
                  {d.tracking_url && (
                    <a
                      href={d.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-2 text-sm font-medium hover:bg-blue-500/20 transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                      Lacak Pengiriman
                    </a>
                  )}

                  {/* Lokasi — status only, no address */}
                  {d.locations.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Status Per Lokasi</p>
                        {d.locations.map((loc, i) => (
                          <div key={loc.id} className="flex flex-col gap-1 pl-3 border-l-2 border-border text-sm">
                            <span className="text-xs text-muted-foreground">
                              {i === 0 ? "Pickup" : `Drop-off ${i}`}
                            </span>
                            <span className="font-medium leading-snug">{loc.name}</span>
                            <span className={`text-xs ${locationStatusClass[loc.delivery_status] ?? "text-muted-foreground"}`}>
                              {(deliveryStatusLabel[loc.delivery_status] ?? loc.delivery_status) || "Belum ada status"}
                            </span>
                            {loc.arrived_at && (
                              <span className="text-xs text-muted-foreground">
                                Tiba: {format(new Date(loc.arrived_at), "dd MMM yyyy, HH:mm")}
                              </span>
                            )}
                            {loc.leaved_at && (
                              <span className="text-xs text-muted-foreground">
                                Keluar: {format(new Date(loc.leaved_at), "dd MMM yyyy, HH:mm")}
                              </span>
                            )}
                            {loc.failed_delivery_reason && (
                              <span className="text-xs text-red-500">{loc.failed_delivery_reason}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog Cancel Order */}
      <Dialog open={openCancelDialog} onOpenChange={(open) => { if (!open) setCancelReason(""); setOpenCancelDialog(open); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="size-4" />
              Batalkan Pesanan (DEBUG ONLY)
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Pesanan akan dibatalkan dan stok produk akan dikembalikan. Tindakan ini tidak dapat diurungkan.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>
              Alasan{" "}
              <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <Textarea
              placeholder="Masukkan alasan pembatalan..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCancelReason(""); setOpenCancelDialog(false); }}>
              Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling && <RefreshCw className="size-3.5 animate-spin" />}
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold leading-none">{order.kode}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dibuat pada{" "}
            {format(new Date(order.created_at), "dd MMM yyyy, HH:mm")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusOrder.className}>
            <span className="opacity-60 font-normal">Pesanan·</span>
            {statusOrder.label}
          </Badge>
          <Badge className={statusPayment.className}>
            <span className="opacity-60 font-normal">Pembayaran·</span>
            {statusPayment.label}
          </Badge>
          {nextStatuses.length > 0 && (
            <Button size="sm" onClick={() => setOpenDialog(true)}>
              <ArrowRight className="size-3.5" />
              {statusConfig[nextStatuses[0]]?.label ?? nextStatuses[0]}
            </Button>
          )}
          {order.order_status !== "COMPLETED" && order.order_status !== "CANCELLED" && (
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setOpenCancelDialog(true)}
            >
              <XCircle className="size-3.5" />
              Batalkan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kolom kiri */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Produk */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="size-4" />
                Item Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {order.items.map(
                (item: OrderDetailResponse["data"]["items"][number]) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.produk.gambar_url && (
                      <img
                        src={item.produk.gambar_url}
                        alt={item.nama_produk}
                        className="size-14 rounded-md object-cover border"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.nama_produk}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.qty} × {formatRupiah(item.harga_satuan)}
                        {Number(item.diskon_satuan) > 0 && (
                          <span className="ml-1 text-red-500">
                            - {formatRupiah(item.diskon_satuan)}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">
                      {formatRupiah(item.subtotal)}
                    </p>
                  </div>
                ),
              )}

              <Separator />

              {/* Rincian biaya */}
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Produk</span>
                  <span>{formatRupiah(order.biaya_produk)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Biaya Pengiriman
                  </span>
                  <span>{formatRupiah(order.biaya_pengiriman)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPN</span>
                  <span>{formatRupiah(order.biaya_ppn)}</span>
                </div>
                {Number(order.biaya_lainnya) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Premi Asuransi
                    </span>
                    <span>{formatRupiah(order.biaya_lainnya)}</span>
                  </div>
                )}
                {Number(order.potongan_kupon) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Potongan Kupon</span>
                    <span>- {formatRupiah(order.potongan_kupon)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total Bayar</span>
                  <span>{formatRupiah(order.total_bayar)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pembayaran */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Receipt className="size-4" />
                Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {order.pembayaran.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Data pembayaran tidak tersedia. Pesanan lama dari migrasi
                  Bulky v1 biasanya tidak membawa riwayat pembayaran.
                </p>
              ) : (
                <>
                  {order.pembayaran.map(
                    (p: OrderDetailResponse["data"]["pembayaran"][number]) => (
                      <div
                        key={p.id}
                        className="rounded-lg border bg-muted/40 px-3 py-2.5 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                            <Badge
                              className={
                                statusConfig[p.status]?.className ?? ""
                              }
                            >
                              {statusConfig[p.status]?.label ?? p.status}
                            </Badge>
                            {p.metode_pembayaran.nama && (
                              <span className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                <span
                                  aria-hidden
                                  className="size-1 shrink-0 rounded-full bg-muted-foreground/50"
                                />
                                {p.metode_pembayaran.nama}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold shrink-0">
                            {formatRupiah(p.jumlah)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                          {p.nama_pembayar && (
                            <div className="flex justify-between gap-3">
                              <span className="text-muted-foreground">
                                Nama Pembayar
                              </span>
                              <span className="font-medium text-right">
                                {p.nama_pembayar}
                              </span>
                            </div>
                          )}
                          {p.paid_at && (
                            <div className="flex justify-between gap-3">
                              <span className="text-muted-foreground">
                                Tanggal Pembayaran
                              </span>
                              <span className="font-medium text-right">
                                {format(
                                  new Date(p.paid_at),
                                  "dd MMM yyyy, HH:mm",
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                  {order.pembayaran.length > 1 && (
                    <div className="flex items-center justify-between border-t pt-2 mt-1 text-sm">
                      <span className="text-muted-foreground">
                        Total {order.pembayaran.length} pembayaran
                      </span>
                      <span className="font-semibold">
                        {formatRupiah(
                          order.pembayaran.reduce(
                            (sum, p) => sum + Number(p.jumlah),
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom kanan */}
        <div className="flex flex-col gap-4">
          {/* Info pembeli */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="size-4" />
                Pembeli
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <p className="font-medium">{order.buyer.nama}</p>
              <p className="text-muted-foreground">{order.buyer.email}</p>
              <p className="text-muted-foreground">{order.buyer.telepon}</p>
            </CardContent>
          </Card>

          {/* Alamat pengiriman */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="size-4" />
                Alamat Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              {alamat ? (
                <>
                  <p className="font-medium">{alamat.label}</p>
                  <p>{alamat.nama_penerima}</p>
                  <p className="text-muted-foreground">{alamat.telepon}</p>
                  <p className="text-muted-foreground">
                    {alamat.alamat_lengkap}
                  </p>
                  <p className="text-muted-foreground">
                    {alamat.kota}, {alamat.provinsi} {alamat.kode_pos}
                  </p>
                </>
              ) : order.delivery_type === "PICKUP" ? (
                <p className="text-muted-foreground italic">
                  Tidak memerlukan alamat pengiriman.
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  Alamat tidak tersedia (migrasi Bulky v1).
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-300 text-xs">
                  {DELIVERY_TYPE_LABEL[order.delivery_type] ?? order.delivery_type}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Info Pengiriman */}
          {order.delivery_type !== "PICKUP" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="size-4" />
                  Info Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {(() => {
                  const si = order.shipping_info;
                  const bsCfg = bookingStatusConfig[si.booking_status] ?? {
                    label: si.booking_status,
                    className: "",
                  };
                  const canRetry =
                    (order.order_status === "PROCESSING" || order.order_status === "READY" || order.order_status === "SHIPPED") &&
                    (si.booking_status === "FAILED" || (si.booking_status === "PENDING" && !si.booking_id && !si.tracking_no));

                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Status Booking
                        </span>
                        <Badge className={bsCfg.className}>
                          {bsCfg.label}
                        </Badge>
                      </div>

                      {si.booking_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Booking ID
                          </span>
                          <span className="font-mono text-xs">
                            {si.booking_id}
                          </span>
                        </div>
                      )}
                      {si.tracking_no && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            No. Resi
                          </span>
                          <span className="font-mono text-xs">
                            {si.tracking_no}
                          </span>
                        </div>
                      )}

                      {si.booking_error && (
                        <div className="flex gap-2 mt-1 p-2 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
                          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                          <span>{si.booking_error}</span>
                        </div>
                      )}

                      {canRetry && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-1"
                          onClick={handleRetryBooking}
                          disabled={isRetrying}
                        >
                          {isRetrying ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="size-3.5" />
                          )}
                          Retry Booking
                        </Button>
                      )}

                      {(si.booking_id || si.tracking_no) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-1"
                            onClick={() => {
                              if (trackingEnabled) {
                                refetchTracking();
                              } else {
                                setTrackingEnabled(true);
                              }
                            }}
                            disabled={isLoadingTracking}
                          >
                            {isLoadingTracking ? (
                              <RefreshCw className="size-3.5 animate-spin" />
                            ) : (
                              <Truck className="size-3.5" />
                            )}
                            {trackingEnabled ? "Refresh Tracking" : "Cek Tracking"}
                          </Button>

                          {trackingData?.data && (
                            <div className="mt-2 rounded-md border border-border overflow-hidden text-xs">
                              {/* Header */}
                              <div className="px-3 py-2 bg-muted/40 border-b border-border">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                  {trackingData.data.provider}
                                </span>
                              </div>

                              {/* Body */}
                              <div className="p-3">
                                {trackingData.data.provider === "DELIVEREE" ? (
                                  <div className="flex flex-col gap-2">
                                    <p className="text-muted-foreground text-[11px]">
                                      Tracking pengiriman tersedia melalui portal Deliveree.
                                    </p>
                                    {trackingData.data.tracking_url ? (
                                      <a
                                        href={trackingData.data.tracking_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-2 font-medium hover:bg-blue-500/20 transition-colors"
                                      >
                                        <ExternalLink className="size-3.5" />
                                        Lacak Pengiriman
                                      </a>
                                    ) : (
                                      <p className="text-muted-foreground italic text-[11px]">
                                        URL tracking belum tersedia.
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {trackingData.data.tracking_url && (
                                      <a
                                        href={trackingData.data.tracking_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 underline mb-3"
                                      >
                                        <ExternalLink className="size-3" />
                                        Lihat Tracking URL
                                      </a>
                                    )}
                                    {trackingData.data.history.length > 0 ? (
                                      <div className="flex flex-col">
                                        {trackingData.data.history.map((evt, i) => (
                                          <div key={i} className="flex gap-2.5 items-start">
                                            <div className="flex flex-col items-center shrink-0">
                                              <div
                                                className={`size-2 rounded-full mt-1 shrink-0 ${
                                                  i === 0
                                                    ? "bg-primary"
                                                    : "bg-muted-foreground/40"
                                                }`}
                                              />
                                              {i < trackingData.data.history.length - 1 && (
                                                <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />
                                              )}
                                            </div>
                                            <div className="pb-3 min-w-0">
                                              <p
                                                className={`leading-tight ${
                                                  i === 0
                                                    ? "font-semibold text-foreground"
                                                    : "font-normal text-muted-foreground/80"
                                                }`}
                                              >
                                                {evt.status}
                                              </p>
                                              <p
                                                className={`text-[11px] mt-0.5 ${
                                                  i === 0
                                                    ? "text-muted-foreground"
                                                    : "text-muted-foreground/60"
                                                }`}
                                              >
                                                {evt.date} {evt.time}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground italic text-[11px]">
                                        Belum ada riwayat pengiriman.
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Deliveree Detail */}
          {order.delivery_type === "DELIVEREE" && order.shipping_info.booking_id && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="size-4" />
                  Detail Deliveree
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (delivereeDetailEnabled) {
                      refetchDelivereeDetail();
                    } else {
                      setDelivereeDetailEnabled(true);
                    }
                    setDelivereeDetailModalOpen(true);
                  }}
                  disabled={isLoadingDelivereeDetail}
                >
                  {isLoadingDelivereeDetail ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Package className="size-3.5" />
                  )}
                  Lihat Detail
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Invoice Forwarder */}
          {(order.delivery_type === "FORWARDER" || order.delivery_type === "FORWARDER_LCL") &&
            order.shipping_info.tracking_no && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="size-4" />
                    Invoice Forwarder
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (invoiceEnabled) {
                        refetchInvoice();
                      } else {
                        setInvoiceEnabled(true);
                      }
                    }}
                    disabled={isLoadingInvoice}
                  >
                    {isLoadingInvoice ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <FileText className="size-3.5" />
                    )}
                    {invoiceEnabled ? "Refresh Invoice" : "Lihat Invoice"}
                  </Button>

                  {invoiceEnabled && invoiceData?.data && (
                    invoiceData.data.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-2">
                        Belum ada invoice tersedia.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3 mt-1">
                        {invoiceData.data.map((inv) => (
                          <div
                            key={inv.invoice_id}
                            className="rounded-md border border-border text-xs overflow-hidden"
                          >
                            <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center justify-between gap-2">
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-semibold truncate">{inv.invoice_no}</span>
                                <span className="text-muted-foreground">{inv.booking_no}</span>
                              </div>
                              <Badge
                                className={
                                  inv.status === "PAID"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0"
                                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400 shrink-0"
                                }
                              >
                                {inv.status}
                              </Badge>
                            </div>
                            <div className="p-3 flex flex-col gap-1.5">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tgl Invoice</span>
                                <span>{inv.invoice_date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Jatuh Tempo</span>
                                <span>{inv.due_date}</span>
                              </div>
                              {inv.data_detail.map((d, i) => (
                                <div key={i} className="flex justify-between">
                                  <span className="text-muted-foreground truncate mr-2">{d.freight_element_name}</span>
                                  <span className="shrink-0">
                                    {Number(d.total_idr).toLocaleString("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                      minimumFractionDigits: 0,
                                    })}
                                  </span>
                                </div>
                              ))}
                              <a
                                href={inv.download_invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 mt-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 font-medium hover:bg-blue-500/20 transition-colors"
                              >
                                <Download className="size-3" />
                                Download PDF
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

          {/* Catatan */}
          {(order.catatan_buyer || order.catatan_admin) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="size-4" />
                  Catatan
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {order.catatan_buyer && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Dari Pembeli
                    </p>
                    <p>{order.catatan_buyer}</p>
                  </div>
                )}
                {order.catatan_admin && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Dari Admin
                    </p>
                    <p>{order.catatan_admin}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Riwayat status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="size-4" />
                Riwayat Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {order.status_history.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Riwayat status tidak tersedia — pesanan lama dari migrasi
                    Bulky v1 biasanya hanya membawa status terakhir.
                  </p>
                ) : (
                  order.status_history.map(
                    (
                      h: OrderDetailResponse["data"]["status_history"][number],
                      i: number,
                    ) => (
                      <div key={i} className="flex gap-3 text-xs">
                        <div className="flex flex-col items-center">
                          <div className="size-2 rounded-full bg-primary mt-0.5 shrink-0" />
                          {i < order.status_history.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="font-medium">
                            {h.status_from ? `${h.status_from} → ` : ""}
                            {h.status_to}
                            <span className="ml-1 text-muted-foreground font-normal">
                              ({h.status_type})
                            </span>
                          </p>
                          {h.note && (
                            <p className="text-muted-foreground">{h.note}</p>
                          )}
                          <p className="text-muted-foreground">
                            {format(new Date(h.created_at), "dd MMM yyyy, HH:mm")}
                          </p>
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
