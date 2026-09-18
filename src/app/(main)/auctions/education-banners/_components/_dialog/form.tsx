"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dropzone } from "@/components/ui/dropzone";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import GB from "country-flag-icons/react/1x1/GB";
import ID from "country-flag-icons/react/1x1/ID";
import { CalendarIcon, Info, Send, X } from "lucide-react";
import { Lottie } from "lottie-react";
import { ComponentProps, useEffect, useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import {
  useCreateAuctionEducationBanner,
  useUpdateAuctionEducationBanner,
} from "../../_api";
import { AuctionEducationBanner } from "../../_api/types";

const imageRules = {
  mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSize: 10 * 1024 * 1024,
};
const schema = z
  .object({
    nama: z
      .string()
      .min(3, "Nama minimal 3 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    urutan: z
      .number()
      .int("Urutan harus berupa bilangan bulat")
      .min(0, "Urutan tidak boleh negatif"),
    gambar_id: z
      .array(
        z
          .file()
          .max(imageRules.maxSize, "Ukuran maksimal 10MB")
          .mime(imageRules.mimeTypes),
      )
      .max(1, "Hanya boleh 1 file")
      .optional(),
    gambar_en: z
      .array(
        z
          .file()
          .max(imageRules.maxSize, "Ukuran maksimal 10MB")
          .mime(imageRules.mimeTypes),
      )
      .max(1, "Hanya boleh 1 file")
      .optional(),
    tanggal_mulai: z.date().optional(),
    tanggal_selesai: z.date().optional(),
  })
  .refine(
    (value) =>
      !value.tanggal_mulai ||
      !value.tanggal_selesai ||
      value.tanggal_selesai > value.tanggal_mulai,
    {
      message: "Tanggal selesai harus setelah tanggal mulai",
      path: ["tanggal_selesai"],
    },
  );
type Values = z.infer<typeof schema>;
type SaveStage = "uploading" | null;

const SaveProgressDialog = ({
  stage,
  mode,
}: {
  stage: SaveStage;
  mode: "create" | "edit" | null;
}) => {
  const isUpdating = mode === "edit";

  return (
    <Dialog open={stage !== null}>
      <DialogContent
        className="w-[min(36rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <div className="grid items-center gap-5 px-6 py-6 sm:grid-cols-[172px_minmax(0,1fr)]">
          <Lottie
            src="/assets/lottie/pc-to-cloud-server.json"
            loop
            autoplay
            className="mx-auto h-32 w-40 sm:mx-0"
            aria-label="Animasi proses penyimpanan banner edukasi"
          />
          <DialogHeader className="items-start gap-2 text-left">
            <DialogTitle>
              {isUpdating
                ? "Memperbarui banner edukasi"
                : "Menyimpan banner edukasi baru"}
            </DialogTitle>
            <DialogDescription className="max-w-sm text-left leading-relaxed">
              Gambar sedang dikompresi ke WebP dan diunggah ke storage, kemudian
              data banner disimpan. Jangan tutup halaman ini.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div
          className="border-t bg-muted/30 px-6 py-3 text-center text-xs text-muted-foreground sm:text-right"
          aria-live="polite"
        >
          Menunggu unggahan dan penyimpanan dikonfirmasi server…
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const DialogFormAuctionEducationBanner = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  detail?: AuctionEducationBanner;
  isDisabled?: boolean;
}) => {
  const formId = useId();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      nama: detail?.nama ?? "",
      urutan: detail?.urutan ?? 0,
      gambar_id: [],
      gambar_en: [],
      tanggal_mulai: detail?.tanggal_mulai
        ? new Date(detail.tanggal_mulai)
        : undefined,
      tanggal_selesai: detail?.tanggal_selesai
        ? new Date(detail.tanggal_selesai)
        : undefined,
    },
  });
  const { mutate: createBanner, isPending: isCreating } =
    useCreateAuctionEducationBanner();
  const { mutate: updateBanner, isPending: isUpdating } =
    useUpdateAuctionEducationBanner();
  const isLoading = isCreating || isUpdating || isDisabled;
  const saveStage: SaveStage = isCreating || isUpdating ? "uploading" : null;
  const [startDate, endDate] = useWatch({
    control: form.control,
    name: ["tanggal_mulai", "tanggal_selesai"],
  });

  const close = () => {
    form.reset();
    onOpenChange(false);
  };
  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);
  const submit = (values: Values) => {
    if (
      mode === "create" &&
      (!values.gambar_id?.[0] || !values.gambar_en?.[0])
    ) {
      if (!values.gambar_id?.[0])
        form.setError("gambar_id", {
          message: "Banner Indonesia wajib diunggah",
        });
      if (!values.gambar_en?.[0])
        form.setError("gambar_en", {
          message: "Banner English wajib diunggah",
        });
      return;
    }
    const body = new FormData();
    body.append("nama", values.nama);
    body.append("urutan", String(values.urutan));
    if (values.gambar_id?.[0]) body.append("gambar_id", values.gambar_id[0]);
    if (values.gambar_en?.[0]) body.append("gambar_en", values.gambar_en[0]);
    if (values.tanggal_mulai)
      body.append("tanggal_mulai", values.tanggal_mulai.toISOString());
    if (values.tanggal_selesai)
      body.append("tanggal_selesai", values.tanggal_selesai.toISOString());
    if (mode === "create") createBanner({ body }, { onSuccess: close });
    if (mode === "edit" && detail)
      updateBanner({ body, params: { id: detail.id } }, { onSuccess: close });
  };

  return (
    <>
      <SaveProgressDialog stage={saveStage} mode={mode} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-h-screen md:min-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "edit"
                ? "Ubah Banner Edukasi Lelang"
                : "Tambah Banner Edukasi Lelang"}
            </DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Kelola materi carousel edukasi auction."
                : "Tambahkan materi carousel edukasi auction di storefront."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="flex flex-col gap-6"
          >
            {mode === "edit" && !detail ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <FieldGroup className="grid max-h-[calc(100vh-200px)] grid-cols-6 gap-4 overflow-y-auto overflow-x-hidden">
                <div className="col-span-full grid grid-cols-1 gap-6">
                  <Controller
                    name="gambar_id"
                    control={form.control}
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="col-span-1 gap-1"
                      >
                        <FieldLabel required htmlFor={`${formId}-id`}>
                          Banner{" "}
                          <ID className="h-3 aspect-3/2 rounded shadow" />
                        </FieldLabel>
                        <Dropzone
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          accept={Object.fromEntries(
                            imageRules.mimeTypes.map((type) => [type, []]),
                          )}
                          maxSize={imageRules.maxSize}
                          oldValue={detail?.gambar_url.id}
                          ratio="banner"
                          safeAreaRatio={3}
                          safeAreaLabel="Aman di mobile"
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
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="col-span-1 gap-1"
                      >
                        <FieldLabel required htmlFor={`${formId}-en`}>
                          Banner{" "}
                          <GB className="h-3 aspect-3/2 rounded shadow" />
                        </FieldLabel>
                        <Dropzone
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          accept={Object.fromEntries(
                            imageRules.mimeTypes.map((type) => [type, []]),
                          )}
                          maxSize={imageRules.maxSize}
                          oldValue={detail?.gambar_url.en ?? undefined}
                          ratio="banner"
                          safeAreaRatio={3}
                          safeAreaLabel="Aman di mobile"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <div className="col-span-full flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs dark:border-blue-300/30 dark:bg-blue-400/10">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
                  <p className="text-blue-700 dark:text-blue-300">
                    Gunakan rasio <strong>~4.2:1</strong>:{" "}
                    <strong>1276 × 302 px</strong> atau{" "}
                    <strong>2552 × 604 px</strong>. Unggahan akan dikompresi
                    menjadi WebP. Pastikan konten penting berada pada area aman
                    mobile.
                  </p>
                </div>
                <Controller
                  name="nama"
                  control={form.control}
                  disabled={isLoading}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="col-span-full gap-1"
                    >
                      <FieldLabel required htmlFor={`${formId}-nama`}>
                        Nama
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${formId}-nama`}
                        placeholder="Nama banner..."
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="urutan"
                  control={form.control}
                  disabled={isLoading}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="col-span-full gap-1"
                    >
                      <FieldLabel required htmlFor={`${formId}-urutan`}>
                        Urutan Tayang
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${formId}-urutan`}
                        type="number"
                        min={0}
                        step={1}
                        value={field.value ?? 0}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Field className="col-span-full gap-1">
                  <FieldLabel>
                    Jadwal tayang{" "}
                    <span className="font-normal text-muted-foreground">
                      (opsional)
                    </span>
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className="justify-start text-xs"
                        >
                          <CalendarIcon className="size-3.5" />
                          {startDate
                            ? `${format(startDate, "PP", { locale: id })}${endDate ? ` — ${format(endDate, "PP", { locale: id })}` : ""}`
                            : "Pilih rentang tanggal"}
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto">
                      <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={{ from: startDate, to: endDate }}
                        onSelect={(range) => {
                          form.setValue("tanggal_mulai", range?.from);
                          form.setValue("tanggal_selesai", range?.to);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.tanggal_selesai && (
                    <FieldError
                      errors={[form.formState.errors.tanggal_selesai]}
                    />
                  )}
                </Field>
              </FieldGroup>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={close}
                disabled={isLoading}
              >
                <X />
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : <Send />}Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
