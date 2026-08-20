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
import { WmsCargoPricedItemType } from "@/app/(main)/products/list/_api/types";
import { useSearch } from "@/hooks/use-search";
import { formatRupiah } from "@/lib/utils";

const formatCargoLabel = (code: string, item?: { length_cm: number; width_cm: number; height_cm: number; weight_kg: number }) =>
  item
    ? `${code} — ${item.length_cm}×${item.width_cm}×${item.height_cm} cm, ${item.weight_kg} kg`
    : code;

/**
 * Field "ID Cargo" untuk form create/edit produk. Defaultnya dropdown berisi
 * cargo WMS yang sudah diberi harga (belum dikonfirmasi sinkron) — memilih
 * salah satu meng-auto-fill dimensi/harga/kategori/kondisi/sumber/merek di
 * form induk (lihat `onSelectCargo`) dan mendownload PDF harga sebagai
 * dokumen produk. Ada toggle "isi manual" untuk produk yang tidak berasal
 * dari WMS.
 */
export const CargoIdField = ({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  idFor,
  currentCode,
  onSelectCargo,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: { message?: string };
  idFor: string;
  /** Kode id_cargo yang sudah tersimpan di produk (mode edit) — supaya tetap
   * tampil di dropdown meski sudah tidak ada lagi di daftar "belum sinkron". */
  currentCode?: string;
  /** Dipanggil dengan data cargo WMS lengkap saat user memilih dari dropdown,
   * atau `null` saat mode manual/dikosongkan — dipakai form induk untuk
   * auto-fill field lain & mendownload PDF harga. */
  onSelectCargo?: (cargo: WmsCargoPricedItemType | null) => void;
}) => {
  const [isManual, setIsManual] = useState(false);
  const { search, searchValue, setSearch } = useSearch();

  const { data, isLoading, isFetching, isError, refetch } =
    useListWmsCargoPriced({ search: searchValue, enabled: !isManual });

  const cargoList = data?.data ?? [];
  const selected = cargoList.find((item) => item.code === value);

  // Kalau value saat ini (mis. dari data produk existing) tidak ditemukan di
  // daftar WMS terkini, anggap manual supaya tidak menampilkan dropdown
  // kosong/membingungkan.
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
            onSelectCargo?.(null);
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
            onSelectCargo?.(item ?? null);
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
                <SelectItem key={item.id} value={item.code}>
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
