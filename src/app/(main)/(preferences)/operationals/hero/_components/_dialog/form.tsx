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
import { AlertCircle, CalendarIcon, Info, Send, X } from "lucide-react";
import { ComponentProps, useEffect, useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Dropzone } from "@/components/ui/dropzone";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import ID from "country-flag-icons/react/1x1/ID";
import GB from "country-flag-icons/react/1x1/GB";
import { useCreateHero, useUpdateHero } from "../../_api";
import { HeroPartIIType, HeroPartIType } from "../../_api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { format, getMonth, setMonth } from "date-fns";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

export const IMAGE_RULES = {
  mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"],
  maxSize: 10 * 1024 * 1024,
};

const formSchema = z.object({
  nama: z.string().min(3, "Nama ID harus memiliki minimal 3 karakter"),
  is_default: z.boolean(),
  tanggal_mulai: z.date().optional(),
  tanggal_selesai: z.date().optional(),
});

export const DialogFormHero = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  detail?: HeroPartIType & HeroPartIIType;
  isDisabled?: boolean;
}) => {
  const idFormStaff = useId();

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
      is_default: detail?.is_default ?? false,
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

  const { mutate: createHero, isPending: isCreating } = useCreateHero();
  const { mutate: updateHero, isPending: isUpdating } = useUpdateHero();

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
    body.append("is_default", values.is_default.toString());
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
        createHero({ body }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        updateHero(
          { body, params: { id: detail?.id ?? "" } },
          { onSuccess: () => handleClose() },
        );
        break;
    }
  };

  const [dateStart, dateEnd, isDefault] = useWatch({
    control: form.control,
    name: ["tanggal_mulai", "tanggal_selesai", "is_default"],
  });

  const dateStartState = form.getFieldState("tanggal_mulai");
  const dateEndState = form.getFieldState("tanggal_selesai");

  useEffect(() => {
    if (isDefault) {
      form.setValue("tanggal_mulai", undefined);
      form.setValue("tanggal_selesai", undefined);
    }
  }, [isDefault]);

  useEffect(() => {
    if (!open) handleClose();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={"xl:min-w-6xl lg:min-w-4xl md:min-w-sm min-w-full"}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Ubah Data Hero" : "Tambah Hero Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Kelola informasi hero" : "Tambahkan hero baru"}
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
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-full">
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
                        ratio="hero"
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
                        ratio="hero"
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="col-span-full px-2 lg:px-3 py-2 border rounded-md flex text-xs items-start gap-2 bg-blue-50 dark:bg-blue-400/10 border-blue-200 dark:border-blue-300/30">
                <Info className="size-3.5 flex-none mt-0.5 text-blue-500" />
                <p className="text-blue-700 dark:text-blue-300">
                  Gunakan rasio <strong>~2:1</strong> — contoh: <strong>1366 × 654 px</strong> (atau 2x lipatnya <strong>2732 × 1308 px</strong> untuk layar retina/HiDPI). Format JPG/PNG/<strong>WebP</strong>, maks 2MB.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 col-span-full items-end">
                <Controller
                  name="nama"
                  control={form.control}
                  disabled={isDisabled}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-2"
                    >
                      <FieldLabel
                        required
                        htmlFor={`${idFormStaff}-${field.name}`}
                      >
                        Nama
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={`${idFormStaff}-${field.name}`}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          placeholder="Nama merek..."
                          autoComplete="off"
                        />
                        <InputGroupAddon>
                          <div className="rounded overflow-hidden size-4 flex items-center justify-center">
                            <ID />
                          </div>
                        </InputGroupAddon>
                      </InputGroup>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="is_default"
                  control={form.control}
                  disabled={isDisabled && detail?.is_default}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-1 h-8 flex items-center! border px-3 rounded-md border-gray-300"
                      orientation="horizontal"
                    >
                      <FieldContent>
                        <FieldLabel htmlFor={`${idFormStaff}-${field.name}`}>
                          Banner Utama
                        </FieldLabel>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldContent>
                      <Switch
                        id={`${idFormStaff}-${field.name}`}
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                        size="sm"
                        className={
                          "data-checked:bg-emerald-500 data-unchecked:bg-red-500"
                        }
                      />
                    </Field>
                  )}
                />
                <Field
                  data-invalid={dateStartState.invalid || dateEndState.invalid}
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
                          disabled={isDefault}
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
                        disabled={{
                          before: new Date(),
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
              </div>
              <div className="col-span-full px-2 lg:px-3 xl:px-5 py-2 border rounded-md flex text-xs xl:text-sm items-center gap-2 bg-yellow-100 dark:bg-yellow-400/30 border-yellow-300 dark:border-yellow-300/50">
                <AlertCircle className="size-3.5 xl:size-4 flex-none" />
                <p>
                  Tanggal tidak dapat diubah ketika banner utama aktif, karena
                  banner utama akan menggantikan banner lain yang tidak aktif
                </p>
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
