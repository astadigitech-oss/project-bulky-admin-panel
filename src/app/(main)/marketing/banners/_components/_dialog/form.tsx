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
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Send, X } from "lucide-react";
import React, { ComponentProps, useEffect, useId, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Dropzone } from "@/components/ui/dropzone";
import ID from "country-flag-icons/react/1x1/ID";
import GB from "country-flag-icons/react/1x1/GB";
import { useCreatePromo, useUpdatePromo } from "../../_api";
import { PromoPartIIType, PromoPartIType } from "../../_api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { format, getMonth, setMonth } from "date-fns";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxValue,
  ComboboxChipsInput,
  useComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { CategorySelectType } from "@/app/(main)/products/categories/_api/types";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { id } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";

export const IMAGE_RULES = {
  mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSize: 10 * 1024 * 1024, // 10MB
};

const formSchema = z.object({
  nama: z.string().min(3, "Nama ID harus memiliki minimal 3 karakter"),
  tujuan: z.array(
    z.object({
      data: z.string(),
    }),
  ),
  tanggal_mulai: z.date().optional(),
  tanggal_selesai: z.date().optional(),
});

export const DialogFormPromo = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
  categories,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  categories: CategorySelectType[];
  detail?: PromoPartIType & PromoPartIIType;
  isDisabled?: boolean;
}) => {
  const idFormStaff = useId();
  const anchor = useComboboxAnchor();

  const getCategoryName = (category?: CategorySelectType) => {
    if (!category) return "-";
    const nama = category.nama as unknown;
    if (typeof nama === "string") return nama;
    return (nama as { id?: string; en?: string })?.id ?? "-";
  };
  const [isEndDate, setIsEndDate] = useState(false);

  const finalSchema = formSchema.extend({
    gambar_id:
      mode === "create"
        ? z
            .array(
              z
                .file()
                .max(IMAGE_RULES.maxSize, "Ukuran maksimal 10MB")
                .mime(IMAGE_RULES.mimeTypes),
            )
            .min(1, "Gambar ID wajib diunggah")
            .max(1, "Hanya boleh 1 file")
        : z
            .array(
              z
                .file()
                .max(IMAGE_RULES.maxSize, "Ukuran maksimal 10MB")
                .mime(IMAGE_RULES.mimeTypes),
            )
            .max(1, "Hanya boleh 1 file")
            .optional(),
    gambar_en:
      mode === "create"
        ? z
            .array(
              z
                .file()
                .max(IMAGE_RULES.maxSize, "Ukuran maksimal 10MB")
                .mime(IMAGE_RULES.mimeTypes),
            )
            .min(1, "Gambar EN wajib diunggah")
            .max(1, "Hanya boleh 1 file")
        : z
            .array(
              z
                .file()
                .max(IMAGE_RULES.maxSize, "Ukuran maksimal 10MB")
                .mime(IMAGE_RULES.mimeTypes),
            )
            .max(1, "Hanya boleh 1 file")
            .optional(),
  });

  const form = useForm<z.infer<typeof finalSchema>>({
    resolver: zodResolver(finalSchema),
    values: {
      nama: detail?.nama ?? "",
      tujuan: detail?.tujuan?.map((i) => ({ data: i })) ?? [],
      tanggal_mulai: detail?.tanggal_mulai
        ? new Date(detail?.tanggal_mulai)
        : undefined,
      tanggal_selesai: detail?.tanggal_selesai
        ? new Date(detail?.tanggal_selesai)
        : undefined,
      gambar_id: [],
      gambar_en: [],
    },
  });

  const { mutate: createPromo, isPending: isCreating } = useCreatePromo();
  const { mutate: updatePromo, isPending: isUpdating } = useUpdatePromo();

  const isLoading = isCreating || isUpdating || isDisabled;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof finalSchema>) => {
    const body = new FormData();
    body.append("nama", values.nama);
    if (values.gambar_id && values.gambar_id.length > 0) {
      body.append("gambar_id", values.gambar_id[0]);
    }
    if (values.gambar_en && values.gambar_en.length > 0) {
      body.append("gambar_en", values.gambar_en[0]);
    }
    if (values.tujuan && values.tujuan.length > 0) {
      for (const t of values.tujuan) {
        body.append("tujuan", t.data);
      }
    }
    if (values.tanggal_mulai) {
      body.append("tanggal_mulai", format(values.tanggal_mulai, "yyyy-MM-dd"));
    }
    if (values.tanggal_selesai) {
      body.append(
        "tanggal_selesai",
        format(values.tanggal_selesai, "yyyy-MM-dd"),
      );
    }
    switch (mode) {
      case "create":
        createPromo({ body }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        updatePromo(
          { body, params: { id: detail?.id ?? "" } },
          { onSuccess: () => handleClose() },
        );
        break;
    }
  };

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "tujuan",
  });

  const [dateStart, dateEnd] = useWatch({
    control: form.control,
    name: ["tanggal_mulai", "tanggal_selesai"],
  });

  const dateStartState = form.getFieldState("tanggal_mulai");
  const dateEndState = form.getFieldState("tanggal_selesai");

  useEffect(() => {
    if (!open) handleClose();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={"md:min-w-2xl max-h-screen"}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Ubah Data Merek" : "Tambah Merek Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi merek"
              : "Tambahkan merek baru"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {mode === "edit" && !detail ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <FieldGroup className="grid md:grid-cols-6 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden">
              <div className="w-full grid grid-cols-1 gap-6 col-span-full">
                <Controller
                  name="gambar_id"
                  control={form.control}
                  disabled={isDisabled}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-1"
                    >
                      <FieldLabel
                        required
                        htmlFor={`${idFormStaff}-${field.name}`}
                      >
                        Banner
                        <ID className="h-3 aspect-3/2 rounded shadow" />
                      </FieldLabel>
                      <Dropzone
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.invalid}
                        accept={Object.fromEntries(
                          IMAGE_RULES.mimeTypes.map((m) => [m, []]),
                        )}
                        maxSize={IMAGE_RULES.maxSize}
                        oldValue={detail?.gambar_url.id}
                        ratio="banner"
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="gambar_en"
                  control={form.control}
                  disabled={isDisabled}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-1"
                    >
                      <FieldLabel
                        required
                        htmlFor={`${idFormStaff}-${field.name}`}
                      >
                        Banner
                        <GB className="h-3 aspect-3/2 rounded shadow" />
                      </FieldLabel>
                      <Dropzone
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.invalid}
                        accept={Object.fromEntries(
                          IMAGE_RULES.mimeTypes.map((m) => [m, []]),
                        )}
                        maxSize={IMAGE_RULES.maxSize}
                        oldValue={detail?.gambar_url.en}
                        ratio="banner"
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name="nama"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormStaff}-${field.name}`}
                    >
                      Nama
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idFormStaff}-${field.name}`}
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Nama banner..."
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field className="gap-1 col-span-full">
                <FieldLabel required htmlFor={`${idFormStaff}-category`}>
                  Kategori Produk
                </FieldLabel>
                <Combobox
                  id={`${idFormStaff}-category`}
                  multiple
                  autoHighlight
                  items={categories}
                  value={fields.map((f) => f.data)}
                  onValueChange={(e) => replace(e.map((i) => ({ data: i })))}
                  isItemEqualToValue={(i: any, s: any) => {
                    if ((i as CategorySelectType).id) {
                      return (i as CategorySelectType).id === s;
                    }
                    return i === s;
                  }}
                >
                  <ComboboxChips ref={anchor} className="w-full">
                    <ComboboxValue>
                      {(values) => (
                        <React.Fragment>
                          {values.map((value: any) => (
                            <ComboboxChip key={value}>
                              {getCategoryName(
                                categories.find((i) => i.id === value),
                              )}
                            </ComboboxChip>
                          ))}
                          <ComboboxChipsInput
                            className={"placeholder:text-xs"}
                            placeholder="Pilih kategori..."
                          />
                        </React.Fragment>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>
                  <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: CategorySelectType) => (
                        <ComboboxItem key={item.id} value={item.id}>
                          {getCategoryName(
                            categories.find((i) => i.id === item.id),
                          )}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
              <div className="col-span-full grid grid-cols-3 items-end gap-6">
                {isEndDate ? (
                  <Field
                    data-invalid={
                      dateStartState.invalid || dateEndState.invalid
                    }
                    className="gap-1 col-span-2"
                  >
                    <FieldLabel required>Tanggal</FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant={
                              dateStartState.invalid || dateEndState.invalid
                                ? "outlineDestructive"
                                : "outline"
                            }
                            className={"justify-start text-xs"}
                          >
                            <CalendarIcon className="size-3.5" />
                            {dateStart && dateEnd
                              ? `${format(dateStart, "PP", { locale: id })} - ${format(dateEnd, "PP", { locale: id })}`
                              : "Pilih tanggal"}
                          </Button>
                        }
                      />
                      <PopoverContent className={"w-auto"}>
                        <Calendar
                          mode="range"
                          numberOfMonths={2}
                          defaultMonth={setMonth(
                            new Date(),
                            getMonth(new Date()) - 1,
                          )}
                          selected={{
                            from: dateStart ? new Date(dateStart) : undefined,
                            to: dateEnd ? new Date(dateEnd) : undefined,
                          }}
                          onSelect={(e) => {
                            form.setValue("tanggal_mulai", e?.from);
                            form.setValue("tanggal_selesai", e?.to);
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    {(dateStartState.invalid || dateEndState.invalid) && (
                      <FieldError
                        errors={[dateStartState.error, dateEndState.error]}
                      />
                    )}
                  </Field>
                ) : (
                  <Field
                    data-invalid={dateStartState.invalid}
                    className="gap-1 col-span-2"
                  >
                    <FieldLabel required>Tanggal Mulai</FieldLabel>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant={
                              dateStartState.invalid
                                ? "outlineDestructive"
                                : "outline"
                            }
                            className={"justify-start text-xs"}
                          >
                            <CalendarIcon className="size-3.5" />
                            {dateStart
                              ? `${format(dateStart, "PP", { locale: id })}`
                              : "Pilih tanggal"}
                          </Button>
                        }
                      />
                      <PopoverContent className={"w-auto"}>
                        <Calendar
                          mode="single"
                          selected={dateStart ? new Date(dateStart) : undefined}
                          onSelect={(e) => {
                            form.setValue("tanggal_mulai", e);
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    {(dateStartState.invalid || dateEndState.invalid) && (
                      <FieldError
                        errors={[dateStartState.error, dateEndState.error]}
                      />
                    )}
                  </Field>
                )}
                <Field
                  className="gap-1 col-span-1 h-8 flex items-center! border px-3 rounded-md border-gray-300"
                  orientation="horizontal"
                >
                  <FieldContent>
                    <FieldLabel htmlFor={`${idFormStaff}_is_end`}>
                      Atur Tanggal Berakhir
                    </FieldLabel>
                  </FieldContent>
                  <Switch
                    id={`${idFormStaff}_is_end`}
                    checked={isEndDate}
                    onCheckedChange={(e) => {
                      setIsEndDate(e);
                      if (e) {
                        form.setValue("tanggal_selesai", dateStart);
                      } else {
                        form.setValue("tanggal_selesai", undefined);
                      }
                    }}
                    size="sm"
                    className={
                      "data-checked:bg-emerald-500 data-unchecked:bg-red-500"
                    }
                  />
                </Field>
              </div>
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
