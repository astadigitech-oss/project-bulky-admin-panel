"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Boxes, Ruler, Save, Weight, X } from "lucide-react";
import { ComponentProps, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useUpdateDelivereeVehicle } from "../../_api";
import { DelivereeVehicle } from "../../_api/types";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  threshold_kubikasi: z
    .number({ message: "Threshold kubikasi harus berupa angka" })
    .min(0, "Tidak boleh negatif")
    .nullable()
    .optional(),
  threshold_berat: z
    .number({ message: "Threshold berat harus berupa angka" })
    .min(0, "Tidak boleh negatif")
    .nullable()
    .optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const EnvironmentBadge = ({
  value,
}: {
  value: "sandbox" | "production";
}) => (
  <Badge
    variant="outline"
    className={cn(
      "gap-1.5 border-transparent font-medium",
      value === "sandbox"
        ? "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
        : "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
    )}
  >
    <span
      className={cn(
        "size-1.5 rounded-full",
        value === "sandbox" ? "bg-amber-500" : "bg-blue-500",
      )}
    />
    {value === "sandbox" ? "Sandbox" : "Produksi"}
  </Badge>
);

export const DialogDetailDelivereeVehicle = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "detail" | "edit" | null;
  detail?: DelivereeVehicle;
  isDisabled?: boolean;
}) => {
  const idForm = useId();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      threshold_kubikasi: detail?.threshold_kubikasi ?? null,
      threshold_berat: detail?.threshold_berat ?? null,
      is_active: detail?.is_active ?? true,
    },
  });

  const { mutate: updateVehicle, isPending: isUpdating } =
    useUpdateDelivereeVehicle();

  const isLoading = isUpdating || isDisabled;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: FormValues) => {
    if (!detail) return;
    updateVehicle(
      {
        params: { id: detail.id },
        body: {
          threshold_kubikasi:
            values.threshold_kubikasi == null || isNaN(values.threshold_kubikasi)
              ? null
              : values.threshold_kubikasi,
          threshold_berat:
            values.threshold_berat == null || isNaN(values.threshold_berat)
              ? null
              : values.threshold_berat,
          is_active: values.is_active,
        },
      },
      { onSuccess: () => handleClose() },
    );
  };

  const infoRows = detail
    ? [
        {
          label: "ID Deliveree",
          value: (
            <Badge variant="secondary" className="tabular-nums font-mono">
              {detail.id_deliveree}
            </Badge>
          ),
        },
        {
          label: "Lingkungan",
          value: <EnvironmentBadge value={detail.environment} />,
        },
        {
          label: "Kubikasi Max",
          value: (
            <span className="flex items-center gap-1.5 tabular-nums">
              <Boxes className="size-3.5 text-muted-foreground" />
              {detail.kubikasi_max?.toLocaleString("id-ID", {
                maximumFractionDigits: 3,
              })}{" "}
              m³
            </span>
          ),
        },
        {
          label: "Berat Max",
          value: (
            <span className="flex items-center gap-1.5 tabular-nums">
              <Weight className="size-3.5 text-muted-foreground" />
              {detail.berat_max?.toLocaleString("id-ID", {
                maximumFractionDigits: 2,
              })}{" "}
              kg
            </span>
          ),
        },
        {
          label: "Dimensi Cargo",
          value: (
            <span className="flex items-center gap-1.5 tabular-nums">
              <Ruler className="size-3.5 text-muted-foreground" />
              {detail.cargo_length != null &&
              detail.cargo_width != null &&
              detail.cargo_height != null
                ? `${detail.cargo_length} × ${detail.cargo_width} × ${detail.cargo_height} cm`
                : "-"}
            </span>
          ),
        },
        {
          label: "Terakhir Sinkron",
          value: detail.last_synced_at
            ? format(detail.last_synced_at, "PPpp", { locale: idLocale })
            : "Belum pernah",
        },
        {
          label: "Dibuat",
          value: format(detail.created_at, "PPpp", { locale: idLocale }),
        },
        {
          label: "Diperbarui",
          value: format(detail.updated_at, "PPpp", { locale: idLocale }),
        },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          {!detail ? (
            <Skeleton className="w-2/3 h-7" />
          ) : (
            <>
              <DialogTitle className="flex items-center gap-2">
                <span className="truncate">{detail.nama}</span>
              </DialogTitle>
              <DialogDescription>
                Master data kendaraan Deliveree — dipakai sebagai acuan pemilihan
                kendaraan saat pembuatan booking berdasarkan kubikasi & berat.
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {mode === "detail" ? (
          <div className="flex flex-col gap-4">
            {!detail ? (
              <Skeleton className="w-full h-64" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {infoRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-1.5 border-b border-border/60 pb-3 last:border-0"
                  >
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {row.label}
                    </span>
                    <span className="text-sm font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button
                disabled={isLoading}
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                <X className="size-3.5" />
                Tutup
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {!detail ? (
              <Skeleton className="w-full h-64" />
            ) : (
              <FieldGroup className="grid sm:grid-cols-2 gap-4">
                <Controller
                  name="threshold_kubikasi"
                  control={form.control}
                  disabled={isLoading}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1"
                    >
                      <FieldLabel
                        htmlFor={`${idForm}-${field.name}`}
                      >
                        Threshold Kubikasi (m³)
                      </FieldLabel>
                      <Input
                        id={`${idForm}-${field.name}`}
                        type="number"
                        step="0.001"
                        min={0}
                        inputMode="decimal"
                        aria-invalid={fieldState.invalid}
                        placeholder="0.000"
                        autoComplete="off"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                      />
                      {fieldState.invalid && (
                        <span className="text-xs text-destructive">
                          {fieldState.error?.message}
                        </span>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="threshold_berat"
                  control={form.control}
                  disabled={isLoading}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1"
                    >
                      <FieldLabel
                        htmlFor={`${idForm}-${field.name}`}
                      >
                        Threshold Berat (kg)
                      </FieldLabel>
                      <Input
                        id={`${idForm}-${field.name}`}
                        type="number"
                        step="0.01"
                        min={0}
                        inputMode="decimal"
                        aria-invalid={fieldState.invalid}
                        placeholder="0.00"
                        autoComplete="off"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                      />
                      {fieldState.invalid && (
                        <span className="text-xs text-destructive">
                          {fieldState.error?.message}
                        </span>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="is_active"
                  control={form.control}
                  disabled={isLoading}
                  render={({ field }) => (
                    <Field className="gap-1 sm:col-span-2">
                      <FieldLabel>Status</FieldLabel>
                      <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                        <span className="text-sm text-muted-foreground">
                          {field.value ? "Aktif — dipakai untuk pemilihan kendaraan" : "Nonaktif — dilewati saat pemilihan kendaraan"}
                        </span>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            )}
            <DialogFooter>
              <Button
                disabled={isLoading}
                type="button"
                variant={"outline"}
                onClick={handleClose}
              >
                <X className="size-3.5" />
                Batal
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
