"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Ratings from "@/components/ui/rating";
import { useGetReviewDetail } from "../_api";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ImageOff, Package, ShoppingCart, User } from "lucide-react";

type ReviewDetailSheetProps = {
  reviewId: string | null;
  onClose: () => void;
};

export const ReviewDetailSheet = ({
  reviewId,
  onClose,
}: ReviewDetailSheetProps) => {
  const { data, isLoading } = useGetReviewDetail({ id: reviewId ?? undefined });
  const review = data?.data;

  return (
    <Sheet open={!!reviewId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Detail Ulasan</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col gap-4 px-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-36" />
          </div>
        ) : review ? (
          <div className="flex flex-col gap-5 px-4 pb-6">
            {/* Rating + Status */}
            <div className="flex items-center justify-between">
              <Ratings
                value={review.rating}
                iconSize={20}
                color="oklch(85.2% 0.199 91.936)"
                readOnly
              />
              <Badge
                className={
                  review.is_approved
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
                }
              >
                {review.is_approved ? "Publik" : "Arsip"}
              </Badge>
            </div>

            {/* Komentar */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Komentar
              </p>
              <p className="text-sm leading-relaxed">
                {review.komentar || (
                  <span className="text-muted-foreground italic">
                    Tidak ada komentar
                  </span>
                )}
              </p>
            </div>

            {/* Gambar */}
            {review.gambar_url ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Gambar
                </p>
                <img
                  src={review.gambar_url}
                  alt="Gambar ulasan"
                  className="rounded-md border object-cover max-h-52 w-full"
                />
              </div>
            ) : null}

            <Separator />

            {/* Produk */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Package className="size-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Produk
                </p>
              </div>
              <div className="flex items-center gap-3">
                {review.produk.gambar_url ? (
                  <img
                    src={review.produk.gambar_url}
                    alt={review.produk.nama}
                    className="size-12 rounded-md border object-cover shrink-0"
                  />
                ) : (
                  <div className="size-12 rounded-md border flex items-center justify-center bg-muted shrink-0">
                    <ImageOff className="size-4 text-muted-foreground" />
                  </div>
                )}
                <p className="text-sm font-medium leading-snug">
                  {review.produk.nama}
                </p>
              </div>
            </div>

            <Separator />

            {/* Pesanan */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="size-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pesanan
                </p>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    No. Pesanan
                  </span>
                  <span className="font-medium">{review.pesanan.kode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Status</span>
                  <Badge className="text-xs bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-300 capitalize">
                    {review.pesanan.order_status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Tanggal</span>
                  <span className="text-xs">
                    {format(
                      new Date(review.pesanan.created_at),
                      "dd MMM yyyy",
                      { locale: idLocale },
                    )}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Buyer */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pembeli
                </p>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Nama</span>
                  <span className="font-medium">{review.buyer.nama}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Email</span>
                  <span className="text-xs">{review.buyer.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Telepon
                  </span>
                  <span className="text-xs">{review.buyer.telepon}</span>
                </div>
              </div>
            </div>

            {/* Approval info */}
            {review.is_approved && review.approved_at && (
              <>
                <Separator />
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Disetujui
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Oleh</span>
                    <span className="text-xs">
                      {review.approved_by?.nama ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Pada</span>
                    <span className="text-xs">
                      {format(
                        new Date(review.approved_at),
                        "dd MMM yyyy, HH:mm",
                        { locale: idLocale },
                      )}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Dibuat</span>
                <span>
                  {format(new Date(review.created_at), "dd MMM yyyy, HH:mm", {
                    locale: idLocale,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Diperbarui</span>
                <span>
                  {format(new Date(review.updated_at), "dd MMM yyyy, HH:mm", {
                    locale: idLocale,
                  })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground px-4">
            Ulasan tidak ditemukan.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
