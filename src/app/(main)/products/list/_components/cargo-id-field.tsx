"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PencilLine, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useListWmsCargoPriced } from "@api/product/list";
import { useSearch } from "@/hooks/use-search";
import { cn, formatRupiah } from "@/lib/utils";

const formatCargoLabel = (code: string, item?: { length_cm: number; width_cm: number; height_cm: number; weight_kg: number }) =>
  item
    ? `${code} — ${item.length_cm}×${item.width_cm}×${item.height_cm} cm, ${item.weight_kg} kg`
    : code;

/**
 * Field "ID Cargo" untuk form create/edit produk. Defaultnya dropdown berisi
 * cargo WMS yang sudah diberi harga (belum dipakai di produk manapun) —
 * memilih salah satu otomatis melampirkan PDF harga WMS ke dokumen produk
 * saat disimpan (lihat BE: attachWmsCargoPricingPDF). Ada toggle "isi manual"
 * untuk produk yang tidak berasal dari WMS.
 */
export const CargoIdField = ({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  idFor,
  currentCode,
  onSelectCargoId,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: { message?: string };
  idFor: string;
  /** Kode id_cargo yang sudah tersimpan di produk (mode edit) — supaya tetap
   * tampil di dropdown meski sudah is_used_in_produk (tidak lagi "unused"). */
  currentCode?: string;
  /** Dipanggil dengan cargo_id (UUID WMS, BUKAN code) saat user memilih dari
   * dropdown WMS, atau `null` saat mode manual/dikosongkan — dipakai form
   * induk untuk memanggil mark-sync setelah create/update produk sukses. */
  onSelectCargoId?: (cargoId: string | null) => void;
}) => {
  const [isManual, setIsManual] = useState(false);
  const { search, searchValue, setSearch } = useSearch();

  const { data, isLoading, isFetching, isError, refetch } =
    useListWmsCargoPriced({ search: searchValue, enabled: !isManual });

  const cargoList = data?.data ?? [];
  const selected = cargoList.find((item) => item.code === value);

  // Kalau value saat ini (mis. dari data produk existing) tidak ditemukan di
  // daftar "belum dipakai" WMS, anggap manual supaya tidak menampilkan
  // dropdown kosong/membingungkan.
  useEffect(() => {
    if (value && currentCode && value === currentCode && !selected && !isLoading) {
      setIsManual(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCode, isLoading]);

  return (
    <Field data-invalid={!!error} className="gap-1">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel required htmlFor={idFor}>
          ID Cargo
        </FieldLabel>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 text-xs px-2"
          disabled={disabled}
          onClick={() => {
            setIsManual((prev) => !prev);
            onChange("");
            onSelectCargoId?.(null);
          }}
        >
          <PencilLine className="size-3" />
          {isManual ? "Pilih dari WMS" : "Isi manual"}
        </Button>
      </div>

      {isManual ? (
        <Input
          id={idFor}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          type="text"
          aria-invalid={!!error}
          placeholder="ID cargo..."
          autoComplete="off"
          disabled={disabled}
        />
      ) : (
        <Select
          value={value}
          onValueChange={(v) => {
            onChange(v ?? "");
            const item = cargoList.find((c) => c.code === v);
            onSelectCargoId?.(item?.cargo_id ?? null);
          }}
          disabled={disabled}
          data-invalid={!!error}
        >
          <SelectTrigger id={idFor} className="w-full">
            <SelectValue placeholder="Pilih cargo dari WMS...">
              {(v: string) => formatCargoLabel(v, selected)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="p-1 pb-1.5" onKeyDown={(e) => e.stopPropagation()}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kode cargo..."
              />
            </div>
            {isLoading || isFetching ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Memuat data...
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-1.5 py-4 text-xs">
                <p className="text-destructive text-center">
                  Gagal memuat daftar cargo dari WMS
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="size-3" />
                  Coba lagi
                </Button>
              </div>
            ) : cargoList.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Tidak ada cargo yang siap dipakai
              </p>
            ) : (
              cargoList.map((item) => (
                <SelectItem key={item.cargo_id} value={item.code}>
                  <div className="flex flex-col">
                    <span>{item.code}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.length_cm}×{item.width_cm}×{item.height_cm} cm,{" "}
                      {item.weight_kg} kg — {formatRupiah(item.sale_price)}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}

      {error?.message && <FieldError errors={[error]} />}
    </Field>
  );
};
