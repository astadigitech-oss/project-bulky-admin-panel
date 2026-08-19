"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, formatRupiah } from "@/lib/utils";
import { useSearch } from "@/hooks/use-search";
import { TooltipText } from "@/providers/tooltip-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Loader2,
  Plug,
  Send,
  XCircle,
} from "lucide-react";
import { ComponentProps, useEffect, useId, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  useListWmsCargo,
  useSetWmsCargoPrice,
  useTestWmsConnection,
} from "@api/product/list";
import { WmsCargoPricingType } from "../../_api/types";

const formatCargoLabel = (item: WmsCargoPricingType) =>
  `${item.code} — ${item.length_cm}×${item.width_cm}×${item.height_cm} cm, ${item.weight_kg} kg`;

const formSchema = z
  .object({
    palet_id: z.string().min(1, "Wajib memilih palet"),
    diskon_type: z.enum(["persentase", "fixed"], {
      message: "Wajib memilih tipe diskon",
    }),
    diskon_value: z.coerce
      .number({ message: "Nilai diskon wajib diisi" })
      .positive("Nilai diskon wajib diisi"),
  })
  .superRefine((data, ctx) => {
    if (data.diskon_type === "persentase" && data.diskon_value > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["diskon_value"],
        message: "Untuk diskon persentase, nilai maksimal adalah 100%",
      });
    }
  });

export const DialogSyncWmsProduct = ({
  open,
  onOpenChange,
  canManageWmsSync = true,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  canManageWmsSync?: boolean;
}) => {
  const idForm = useId();

  const [wmsStatus, setWmsStatus] = useState<{
    state: "idle" | "success" | "error";
    message: string;
  }>({ state: "idle", message: "" });

  const { mutate: testWmsConnection, isPending: isTestingWms } =
    useTestWmsConnection();

  const runTestWmsConnection = (opts?: { silent?: boolean }) => {
    testWmsConnection(
      {},
      {
        onSuccess: ({ data }) => {
          if (!opts?.silent) toast.success(data.message);
          setWmsStatus({ state: "success", message: data.message });
        },
        onError: (err) => {
          const message =
            (err?.response?.data as any)?.message ??
            err?.message ??
            "Gagal terhubung ke WMS";
          setWmsStatus({ state: "error", message });
        },
      },
    );
  };

  const handleTestWmsConnection = () => runTestWmsConnection();

  const { search, searchValue, setSearch } = useSearch();

  const {
    data: cargoListData,
    isLoading: isLoadingCargo,
    isFetching: isFetchingCargo,
    isError: isErrorCargo,
    refetch: refetchCargo,
  } = useListWmsCargo({
    page: 1,
    limit: 50,
    search: searchValue,
    enabled: open,
  });

  const cargoList = cargoListData?.data ?? [];

  const { mutate: setWmsCargoPrice, isPending: isSavingPrice } =
    useSetWmsCargoPrice();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      palet_id: "",
      diskon_type: "persentase" as const,
      diskon_value: undefined,
    },
  });

  const paletId = useWatch({ control: form.control, name: "palet_id" });
  const diskonType = useWatch({ control: form.control, name: "diskon_type" });
  const diskonValue = useWatch({ control: form.control, name: "diskon_value" });

  const selectedPalet = useMemo(
    () => cargoList.find((item) => item.id === paletId),
    [cargoList, paletId],
  );

  const hargaJual = useMemo(() => {
    if (!selectedPalet) return null;
    const value = Number(diskonValue);
    if (!value || value <= 0) return null;
    if (diskonType === "persentase") {
      if (value > 100) return null;
      return Math.round(
        selectedPalet.total_price - (selectedPalet.total_price * value) / 100,
      );
    }
    if (diskonType === "fixed") {
      return Math.max(selectedPalet.total_price - value, 0);
    }
    return null;
  }, [selectedPalet, diskonType, diskonValue]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSearch("");
    setWmsStatus({ state: "idle", message: "" });
  };

  const onSubmit = () => {
    if (!selectedPalet || !diskonValue) return;
    setWmsCargoPrice(
      {
        params: { id: selectedPalet.id },
        body: {
          type: diskonType === "persentase" ? "discount" : "fix",
          value: Number(diskonValue),
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  useEffect(() => {
    if (open) {
      runTestWmsConnection({ silent: true });
    } else {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="md:min-w-xl md:max-w-3xl flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Sinkronisasi Harga Jual Palet dari WMS</DialogTitle>
          <DialogDescription>
            Harga dari WMS masih berupa <strong>harga inventory</strong>{" "}
            (belum harga jual). Tentukan diskon di bawah untuk menghitung
            harga jual.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <DialogBody>
          <div className="flex flex-col gap-5 sm:flex-row">
            <FieldGroup className="sm:w-1/2">
              <Controller
                name="palet_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required>Pilih Palet (WMS)</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                      data-invalid={fieldState.invalid}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih palet dari WMS...">
                          {(value: string) => {
                            const item = cargoList.find((i) => i.id === value);
                            return item ? formatCargoLabel(item) : "";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-1 pb-1.5" onKeyDown={(e) => e.stopPropagation()}>
                          <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode palet..."
                          />
                        </div>
                        {isLoadingCargo || isFetchingCargo ? (
                          <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                            <Loader2 className="size-3.5 animate-spin" />
                            Memuat data...
                          </div>
                        ) : isErrorCargo ? (
                          <div className="flex flex-col items-center gap-1.5 py-4 text-xs">
                            <p className="text-destructive text-center">
                              Gagal memuat daftar palet dari WMS
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => refetchCargo()}
                            >
                              Coba lagi
                            </Button>
                          </div>
                        ) : cargoList.length === 0 ? (
                          <p className="py-4 text-center text-xs text-muted-foreground">
                            Tidak ada palet ditemukan
                          </p>
                        ) : (
                          cargoList.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex flex-col">
                                <span>{item.code}</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.length_cm}×{item.width_cm}×
                                  {item.height_cm} cm, {item.weight_kg} kg —{" "}
                                  {formatRupiah(item.total_price)}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {selectedPalet ? (
                <div className="flex flex-col border rounded-lg border-gray-300 dark:border-gray-300/50 text-xs overflow-hidden">
                  <InfoPaletRow label="Kode Palet" value={selectedPalet.code} />
                  <InfoPaletRow
                    label="Dimensi"
                    value={`${selectedPalet.length_cm}×${selectedPalet.width_cm}×${selectedPalet.height_cm} cm`}
                  />
                  <InfoPaletRow
                    label="Berat"
                    value={`${selectedPalet.weight_kg} kg`}
                  />
                  <InfoPaletRow
                    label="Harga Asal (Inventory)"
                    value={formatRupiah(selectedPalet.total_price)}
                  />
                  <InfoPaletRow
                    label="Kategori"
                    value={selectedPalet.bulky_category?.name ?? "-"}
                  />
                  <InfoPaletRow
                    label="Kondisi Produk"
                    value={selectedPalet.bulky_product_condition?.name ?? "-"}
                  />
                  <InfoPaletRow
                    label="Kondisi Paket"
                    value={selectedPalet.bulky_package_condition?.name ?? "-"}
                  />
                  <InfoPaletRow
                    label="Sumber"
                    value={selectedPalet.bulky_product_source?.name ?? "-"}
                  />
                  {selectedPalet.bulky_brands &&
                    selectedPalet.bulky_brands.length > 0 && (
                      <InfoPaletRow
                        label="Merek"
                        value={selectedPalet.bulky_brands
                          .map((b) => b.name)
                          .join(", ")}
                      />
                    )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
                  Detail palet akan tampil di sini setelah Anda memilih palet
                  dari daftar.
                </div>
              )}
            </FieldGroup>

            <Separator orientation="vertical" className="hidden sm:block" />
            <Separator orientation="horizontal" className="sm:hidden" />

            <FieldGroup className="sm:w-1/2">
              <div className="flex flex-col gap-2 px-2 lg:px-3 py-2.5 border rounded-md text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Koneksi WMS</p>
                  <TooltipText
                    value={
                      canManageWmsSync
                        ? "Uji koneksi ke WMS"
                        : "Anda tidak memiliki izin untuk menguji koneksi WMS (perlu izin produk:create atau produk:update)"
                    }
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={isTestingWms || !canManageWmsSync}
                        onClick={handleTestWmsConnection}
                      >
                        <Plug className="size-3.5" />
                        {isTestingWms ? "Menguji..." : "Test Koneksi WMS"}
                      </Button>
                    }
                  />
                </div>
                {wmsStatus.state !== "idle" && (
                  <div
                    className={cn(
                      "flex items-start gap-1.5 rounded-md px-2 py-1.5",
                      wmsStatus.state === "success" &&
                        "bg-emerald-50 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
                      wmsStatus.state === "error" &&
                        "bg-red-50 dark:bg-red-400/10 text-red-700 dark:text-red-300",
                    )}
                  >
                    {wmsStatus.state === "success" ? (
                      <CheckCircle2 className="size-3.5 flex-none mt-0.5" />
                    ) : (
                      <XCircle className="size-3.5 flex-none mt-0.5" />
                    )}
                    <p>{wmsStatus.message}</p>
                  </div>
                )}
              </div>

              <Controller
                name="diskon_type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required>Tipe Diskon</FieldLabel>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                      className="flex flex-row flex-wrap gap-4"
                    >
                      <Label className="flex items-center gap-1.5 font-normal cursor-pointer">
                        <RadioGroupItem value="persentase" />
                        Persentase (%)
                      </Label>
                      <Label className="flex items-center gap-1.5 font-normal cursor-pointer">
                        <RadioGroupItem value="fixed" />
                        Potongan Tetap (Rp)
                      </Label>
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="diskon_value"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required htmlFor={`${idForm}-${field.name}`}>
                      {diskonType === "fixed"
                        ? "Nominal Potongan Harga"
                        : "Persentase Diskon"}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        {diskonType === "fixed" ? "Rp" : "%"}
                      </InputGroupAddon>
                      <InputGroupInput
                        value={(field.value as number | string | undefined) ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        type="number"
                        id={`${idForm}-${field.name}`}
                        aria-invalid={fieldState.invalid}
                        placeholder={
                          diskonType === "fixed" ? "Contoh: 500000" : "Contoh: 10"
                        }
                        max={diskonType === "persentase" ? 100 : undefined}
                      />
                    </InputGroup>
                    <p className="text-xs text-muted-foreground">
                      {diskonType === "fixed"
                        ? "Masukkan nominal rupiah potongan langsung dari harga asal."
                        : "Masukkan angka persen. Contoh: 10 = potongan 10% dari harga asal."}
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field className="gap-1">
                <FieldLabel>Harga Jual</FieldLabel>
                {hargaJual !== null ? (
                  <div
                    className={cn(
                      "rounded-lg border border-emerald-200 dark:border-emerald-300/30",
                      "bg-emerald-50 dark:bg-emerald-400/10 px-3 py-2.5",
                    )}
                  >
                    <p className="text-base font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                      {formatRupiah(hargaJual)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
                    Lengkapi palet, tipe diskon, dan nilai diskon untuk
                    melihat harga jual
                  </div>
                )}
              </Field>
            </FieldGroup>
          </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSavingPrice}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSavingPrice || !selectedPalet}>
              {isSavingPrice ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Simpan Harga Jual
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const InfoPaletRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex w-full min-h-8 border-t border-gray-300 dark:border-gray-300/50 first:border-t-0">
    <p className="w-28 sm:w-32 bg-gray-100 dark:bg-gray-800 flex items-center px-2 py-1.5 font-semibold flex-none">
      {label}
    </p>
    <div className="flex flex-wrap gap-2 px-2 py-1.5 items-center">
      {value}
    </div>
  </div>
);
