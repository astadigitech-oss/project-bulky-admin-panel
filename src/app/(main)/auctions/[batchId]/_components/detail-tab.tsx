"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Image from "next/image";
import { cn, formatImageAlt, formatRupiah, sizesImage } from "@/lib/utils";
import { AuctionBatchDetail } from "../../_api/types";
import { auctionStatusVariant } from "../../list/_components/columns";

export const DetailTab = ({ batch }: { batch: AuctionBatchDetail }) => {
  const status = auctionStatusVariant[batch.status];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        {/* Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Galeri</CardTitle>
          </CardHeader>
          <CardContent>
            {(batch.images ?? []).length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {(batch.images ?? []).map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-md border bg-muted"
                  >
                    <Image
                      src={img.url}
                      alt={formatImageAlt(batch.nama_id)}
                      fill
                      sizes={sizesImage}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada gambar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Item Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {(batch.items ?? []).length > 0 ? (
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Produk</th>
                      <th className="px-3 py-2 text-right">Harga</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(batch.items ?? []).map((item, index) => (
                      <tr key={item.produk_id ?? `manual-${index}`} className="border-t">
                        <td className="px-3 py-2"><div>{item.nama_snapshot}</div><span className="text-[10px] text-muted-foreground">{item.source_type === "MANUAL" ? "Input manual" : "Katalog Bulky"}</span></td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatRupiah(item.unit_price_snapshot)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatRupiah(item.subtotal_snapshot)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada produk.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Analitik */}
        <Card>
          <CardHeader>
            <CardTitle>Analitik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Metric label="Bidder" value={String(batch.bidder_count)} />
              <Metric label="Bid" value={String(batch.bid_count)} />
              <Metric label="View" value={String(batch.view_count)} />
              <Metric
                label="Bid Tertinggi"
                value={
                  batch.highest_bid
                    ? formatRupiah(batch.highest_bid)
                    : "-"
                }
              />
              <Metric
                label="Bid Terendah"
                value={
                  batch.lowest_bid ? formatRupiah(batch.lowest_bid) : "-"
                }
              />
              <Metric
                label="Repeat Bidder"
                value={String(batch.repeat_bidder_count)}
              />
              <Metric
                label="Bid Tambahan"
                value={String(batch.additional_bid_count)}
              />
              <Metric
                label="Waktu Terjual"
                value={
                  batch.time_to_sold_seconds != null
                    ? `${batch.time_to_sold_seconds}s`
                    : "-"
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Batch</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <InfoRow label="Kode" value={batch.code} mono />
            <InfoRow label="Status" value={status.label} badge={status.variant} />
            <InfoRow
              label="Grand Total"
              value={formatRupiah(batch.grand_total)}
            />
            <InfoRow
              label="Min Bid (0.1%)"
              value={formatRupiah(batch.min_bid_amount)}
            />
            <InfoRow label="Total Qty" value={String(batch.total_quantity)} />
            <InfoRow label="Volume" value={`${batch.volume_m3} m³`} />
            <InfoRow
              label="Ukuran"
              value={`${batch.panjang_cm} × ${batch.lebar_cm} × ${batch.tinggi_cm} cm`}
            />
            <InfoRow label="Berat" value={`${batch.berat_kg} kg`} />
            <InfoRow
              label="Discrepancy"
              value={`${batch.discrepancy_percentage}%`}
            />
            <InfoRow label="Asal Pengiriman" value={batch.origin_type === "SUPPLIER" ? "Gudang Supplier" : "Gudang Bulky"} />
            {batch.origin_type === "SUPPLIER" && <>
              <InfoRow label="Supplier" value={batch.supplier_name ?? "-"} />
              <InfoRow label="Alamat" value={batch.supplier_address ?? "-"} />
              <InfoRow
                label="Wilayah"
                value={[batch.supplier_kecamatan, batch.supplier_kota, batch.supplier_provinsi].filter(Boolean).join(", ") || "-"}
              />
              {(batch.supplier_kelurahan || batch.supplier_kode_pos) && (
                <InfoRow
                  label="Kel. / Pos"
                  value={[batch.supplier_kelurahan, batch.supplier_kode_pos].filter(Boolean).join(" - ") || "-"}
                />
              )}
              <InfoRow
                label="Koordinat"
                value={
                  batch.supplier_latitude && batch.supplier_longitude
                    ? `${batch.supplier_latitude}, ${batch.supplier_longitude}`
                    : "-"
                }
                mono
              />
            </>}
          </CardContent>
        </Card>

        {batch.winner && (
          <Card>
            <CardHeader>
              <CardTitle>Pemenang</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <InfoRow label="Buyer" value={batch.winner.buyer.nama} />
              <InfoRow
                label="Deal"
                value={formatRupiah(batch.winner.deal_amount)}
              />
              <InfoRow
                label="Pembayaran"
                value={batch.winner.payment_status}
                badge={batch.winner.payment_status === "PAID" ? "default" : "secondary"}
              />
              <InfoRow
                label="Fulfillment"
                value={batch.winner.fulfillment_status}
                badge={
                  batch.winner.fulfillment_status === "COMPLETED"
                    ? "default"
                    : "secondary"
                }
              />
              {batch.winner.note && (
                <p className="text-xs text-muted-foreground">
                  {batch.winner.note}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {batch.pdf && (
          <Card>
            <CardHeader>
              <CardTitle>Dokumen PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 break-all text-sm text-muted-foreground">
                  {batch.pdf.original_name}
                </p>
                <Button render={<a href={batch.pdf.url} target="_blank" rel="noreferrer" />} variant="outline" size="sm">
                  <Eye className="size-4" />
                  Lihat PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
  </div>
);

const InfoRow = ({
  label,
  value,
  mono,
  badge,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: "default" | "secondary" | "outline" | "destructive";
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-muted-foreground">{label}</span>
    {badge ? (
      <Badge variant={badge} className="capitalize">
        {value}
      </Badge>
    ) : (
      <span
        className={cn(
          "text-sm font-medium text-right",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    )}
  </div>
);
