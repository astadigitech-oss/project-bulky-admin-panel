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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, Send, X } from "lucide-react";
import { ComponentProps, useEffect, useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCoupon,
  useGenerateCouponCode,
  useUpdateCoupon,
} from "../../_api";
import {
  CouponCategoryType,
  CouponDetailType,
  JenisDiskonType,
} from "../../_api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

const formSchema = z.object({
  kode: z.string().min(3, "Kode harus memiliki minimal 3 karakter"),
  nama: z.string().min(3, "Nama harus memiliki minimal 3 karakter"),
  deskripsi: z.string().nullable().optional(),
  jenis_diskon: z.enum(["persentase", "jumlah_tetap"]),
  nilai_diskon: z.coerce.number().min(1, "Nilai diskon wajib diisi"),
  minimal_pembelian: z.coerce.number().min(0, "Minimal pembelian wajib diisi"),
  limit_pemakaian: z.coerce.number().min(0).nullable().optional(),
  tanggal_kedaluarsa: z.string().min(1, "Tanggal kedaluarsa wajib diisi"),
  is_all_kategori: z.boolean(),
  kategori: z.array(z.string()).optional(),
});

export const DialogFormCoupon = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
  categories,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  categories: CouponCategoryType[];
  detail?: CouponDetailType;
  isDisabled?: boolean;
}) => {
  const idForm = useId();
  const anchor = useComboboxAnchor();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      kode: detail?.kode ?? "",
      nama: detail?.nama ?? "",
      deskripsi: detail?.deskripsi ?? "",
      jenis_diskon: (detail?.jenis_diskon as JenisDiskonType) ?? "persentase",
      nilai_diskon: detail?.nilai_diskon ?? 0,
      minimal_pembelian: detail?.minimal_pembelian ?? 0,
      limit_pemakaian: detail?.limit_pemakaian ?? null,
      tanggal_kedaluarsa: detail?.tanggal_kedaluarsa
        ? detail.tanggal_kedaluarsa.slice(0, 10)
        : "",
      is_all_kategori: detail?.is_all_kategori ?? true,
      kategori: detail?.kategori?.map((i) => i.id) ?? [],
    },
  });

  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();
  const { mutate: generateCode, isPending: isGeneratingCode } =
    useGenerateCouponCode();

  const isLoading = isCreating || isUpdating || isDisabled;

  const isAllKategori = useWatch({
    control: form.control,
    name: "is_all_kategori",
  });

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const handleGenerateCode = () => {
    generateCode(
      { body: { prefix: "BULKY", length: 8 } },
      {
        onSuccess: ({ data }) => {
          form.setValue("kode", data.data.kode);
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      ...values,
      deskripsi: values.deskripsi?.trim() ? values.deskripsi.trim() : "",
      limit_pemakaian: values.limit_pemakaian ?? undefined,
      kategori: values.is_all_kategori ? [] : (values.kategori ?? []),
      tanggal_kedaluarsa: `${values.tanggal_kedaluarsa}T23:59:59Z`,
    };

    switch (mode) {
      case "create":
        createCoupon({ body: payload }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        updateCoupon(
          { body: payload, params: { id: detail?.id ?? "" } },
          { onSuccess: () => handleClose() },
        );
        break;
    }
  };

  useEffect(() => {
    if (!open) handleClose();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="md:min-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Ubah Data Kupon" : "Tambah Kupon Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi kupon"
              : "Tambahkan kupon baru"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {mode === "edit" && !detail ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <FieldGroup className="grid md:grid-cols-2 gap-4">
              <Controller
                name="kode"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required htmlFor={`${idForm}-${field.name}`}>
                      Kode
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        {...field}
                        id={`${idForm}-${field.name}`}
                        aria-invalid={fieldState.invalid}
                        placeholder="Kode kupon..."
                        autoComplete="off"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateCode}
                        disabled={isGeneratingCode || isLoading}
                      >
                        {isGeneratingCode ? (
                          <Spinner className="size-3.5" />
                        ) : (
                          <RefreshCw className="size-3.5" />
                        )}
                      </Button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="nama"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required htmlFor={`${idForm}-${field.name}`}>
                      Nama
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idForm}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Nama kupon..."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="jenis_diskon"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required>Jenis Diskon</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis diskon..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="persentase">Persentase</SelectItem>
                        <SelectItem value="jumlah_tetap">
                          Jumlah Tetap
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="nilai_diskon"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required htmlFor={`${idForm}-${field.name}`}>
                      Nilai Diskon
                    </FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      id={`${idForm}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="0"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="minimal_pembelian"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required htmlFor={`${idForm}-${field.name}`}>
                      Minimal Pembelian
                    </FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      id={`${idForm}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="0"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="limit_pemakaian"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor={`${idForm}-${field.name}`}>
                      Limit Pemakaian
                    </FieldLabel>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                      type="number"
                      id={`${idForm}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Kosongkan untuk tanpa batas"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="tanggal_kedaluarsa"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required htmlFor={`${idForm}-${field.name}`}>
                      Tanggal Kedaluarsa
                    </FieldLabel>
                    <Input
                      {...field}
                      type="date"
                      id={`${idForm}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="is_all_kategori"
                control={form.control}
                disabled={isLoading}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Semua Kategori</FieldLabel>
                    <div className="h-8 flex items-center">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={field.disabled}
                      />
                    </div>
                  </Field>
                )}
              />

              {!isAllKategori && (
                <Controller
                  name="kategori"
                  control={form.control}
                  disabled={isLoading}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <FieldLabel required>Kategori</FieldLabel>
                      <Combobox
                        multiple
                        autoHighlight
                        items={categories}
                        value={field.value ?? []}
                        onValueChange={field.onChange}
                        disabled={field.disabled}
                        isItemEqualToValue={(i: any, s: any) => {
                          if (i?.id) return i.id === s;
                          return i === s;
                        }}
                      >
                        <ComboboxChips ref={anchor} className="w-full">
                          <ComboboxValue>
                            {(values) => (
                              <>
                                {values.map((value: any) => (
                                  <ComboboxChip key={value}>
                                    {
                                      categories.find((c) => c.id === value)
                                        ?.nama.id
                                    }
                                  </ComboboxChip>
                                ))}
                              </>
                            )}
                          </ComboboxValue>
                          <ComboboxChipsInput placeholder="Pilih kategori..." />
                        </ComboboxChips>
                        <ComboboxContent anchor={anchor}>
                          <ComboboxEmpty>Tidak ada data.</ComboboxEmpty>
                          <ComboboxList>
                            {categories.map((item) => (
                              <ComboboxItem key={item.id} value={item.id}>
                                {item.nama.id}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}

              <Controller
                name="deskripsi"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel htmlFor={`${idForm}-${field.name}`}>
                      Deskripsi
                    </FieldLabel>
                    <Textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      id={`${idForm}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Deskripsi kupon..."
                      className="min-h-20"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          )}

          <DialogFooter>
            <Button
              disabled={isLoading}
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              <X className="size-3.5" />
              Batal
            </Button>
            <Button disabled={isLoading} type="submit">
              {isLoading ? (
                <Spinner className="size-3.5" />
              ) : (
                <Send className="size-3.5" />
              )}
              {isLoading ? "Mengirim..." : "Kirim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
