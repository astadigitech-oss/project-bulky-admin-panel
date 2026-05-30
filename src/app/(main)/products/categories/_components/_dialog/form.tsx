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
import { Send, X } from "lucide-react";
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
import { useCreateCategory, useUpdateCategory } from "../../_api";
import { CategoryPartIIType, CategoryPartIType } from "../../_api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export const IMAGE_RULES = {
  mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSize: 10 * 1024 * 1024, // 10MB
};

const formSchema = z.object({
  nama_id: z.string().min(3, "Nama ID harus memiliki minimal 3 karakter"),
  nama_en: z.string().min(3, "Nama EN harus memiliki minimal 3 karakter"),
  deskripsi: z.string().nullable().optional(),
  teks_kondisi: z
    .string()
    .min(3, "Text Kondisi harus memiliki minimal 3 karakter")
    .optional(),
  tipe_kondisi_tambahan: z.enum(["TEKS", "GAMBAR"]).optional(),
  gambar_kondisi: z
    .array(
      z
        .file()
        .max(IMAGE_RULES.maxSize, "Ukuran maksimal 10MB")
        .mime(IMAGE_RULES.mimeTypes),
    )
    .max(1, "Hanya boleh 1 file")
    .optional(),
});

const DialogFormCategory = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  detail?: CategoryPartIType & CategoryPartIIType;
  isDisabled?: boolean;
}) => {
  const idFormStaff = useId();

  const finalSchema = formSchema.extend({
    icon:
      mode === "create"
        ? z
            .array(
              z
                .file()
                .max(IMAGE_RULES.maxSize, "Ukuran maksimal 10MB")
                .mime(IMAGE_RULES.mimeTypes),
            )
            .min(1, "Icon wajib diunggah")
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
      nama_id: detail?.nama.id ?? "",
      nama_en: detail?.nama.en ?? "",
      deskripsi: detail?.deskripsi ?? "",
      tipe_kondisi_tambahan: detail?.tipe_kondisi_tambahan ?? undefined,
      teks_kondisi: undefined,
      icon: [],
      gambar_kondisi: [],
    },
  });

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const isLoading = isCreating || isUpdating || isDisabled;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof finalSchema>) => {
    if (values.tipe_kondisi_tambahan === "TEKS" && !values.teks_kondisi) {
      form.setError("teks_kondisi", { message: "Teks kondisi wajib diisi" });
      return;
    }
    if (
      values.tipe_kondisi_tambahan === "GAMBAR" &&
      mode === "create" &&
      (!values.gambar_kondisi || values.gambar_kondisi?.length === 0)
    ) {
      form.setError("gambar_kondisi", {
        message: "Gambar kondisi wajib diisi",
      });
      return;
    }
    switch (mode) {
      case "create":
        const bodyCreate = new FormData();
        bodyCreate.append("nama_id", values.nama_id);
        bodyCreate.append("nama_en", values.nama_en);
        const deskripsiCreate = values.deskripsi?.trim();
        bodyCreate.append(
          "deskripsi",
          deskripsiCreate ? deskripsiCreate : "null",
        );
        if (values.icon && values.icon.length > 0) {
          bodyCreate.append("icon", values.icon[0]);
        }
        if (values.tipe_kondisi_tambahan) {
          bodyCreate.append(
            "tipe_kondisi_tambahan",
            values.tipe_kondisi_tambahan,
          );
          if (values.tipe_kondisi_tambahan === "TEKS") {
            bodyCreate.append("teks_kondisi", values.teks_kondisi ?? "");
          } else if (
            values.tipe_kondisi_tambahan === "GAMBAR" &&
            values.gambar_kondisi &&
            values.gambar_kondisi.length > 0
          ) {
            bodyCreate.append("gambar_kondisi", values.gambar_kondisi[0]);
          }
        }
        createCategory(
          { body: bodyCreate },
          { onSuccess: () => handleClose() },
        );
        break;
      case "edit":
        const bodyUpdate = new FormData();
        bodyUpdate.append("nama_id", values.nama_id);
        bodyUpdate.append("nama_en", values.nama_en);
        const deskripsiUpdate = values.deskripsi?.trim();
        bodyUpdate.append(
          "deskripsi",
          deskripsiUpdate ? deskripsiUpdate : "null",
        );
        if (values.icon && values.icon.length > 0) {
          bodyUpdate.append("icon", values.icon[0]);
        }
        if (values.tipe_kondisi_tambahan) {
          bodyUpdate.append(
            "tipe_kondisi_tambahan",
            values.tipe_kondisi_tambahan,
          );
          if (values.tipe_kondisi_tambahan === "TEKS") {
            bodyUpdate.append("teks_kondisi", values.teks_kondisi ?? "");
          } else if (
            values.tipe_kondisi_tambahan === "GAMBAR" &&
            values.gambar_kondisi &&
            values.gambar_kondisi.length > 0
          ) {
            bodyUpdate.append("gambar_kondisi", values.gambar_kondisi[0]);
          }
        }
        updateCategory(
          { body: bodyUpdate, params: { id: detail?.id ?? "" } },
          { onSuccess: () => handleClose() },
        );
        break;
    }
  };

  const formatValue = (value: string | undefined, invert = false) => {
    if (invert) {
      switch (value) {
        case "text":
          return "TEKS";
        case "image":
          return "GAMBAR";
        default:
          return undefined;
      }
    }

    switch (value) {
      case "TEKS":
        return "text";
      case "GAMBAR":
        return "image";
      default:
        return "none";
    }
  };

  const formType = useWatch({
    control: form.control,
    name: "tipe_kondisi_tambahan",
  });

  useEffect(() => {
    if (formType === "TEKS") {
      form.setValue("teks_kondisi", detail?.teks_kondisi ?? "");
    } else {
      form.setValue("teks_kondisi", undefined);
    }
  }, [formType, detail]);

  useEffect(() => {
    if (!open) handleClose();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Ubah Data Kategori" : "Tambah Kategori Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi kategori"
              : "Tambahkan kategori baru"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}
          className="flex flex-col gap-6"
        >
          {mode === "edit" && !detail ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <FieldGroup className="grid md:grid-cols-6 gap-4">
              <Controller
                name="icon"
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
                      Icon
                    </FieldLabel>
                    <Dropzone
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      accept={Object.fromEntries(
                        IMAGE_RULES.mimeTypes.map((m) => [m, []]),
                      )}
                      maxSize={IMAGE_RULES.maxSize}
                      oldValue={detail?.icon_url}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="grid md:grid-cols-6 gap-2 col-span-full">
                <Controller
                  name="nama_id"
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
                  name="nama_en"
                  control={form.control}
                  disabled={isDisabled}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="col-span-full"
                    >
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={`${idFormStaff}-${field.name}`}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          placeholder="Category name..."
                          autoComplete="off"
                        />
                        <InputGroupAddon>
                          <div className="rounded overflow-hidden size-4 flex items-center justify-center">
                            <GB />
                          </div>
                        </InputGroupAddon>
                      </InputGroup>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name="deskripsi"
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
                      Deskripsi
                    </FieldLabel>
                    <Textarea
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value ?? ""}
                      id={`${idFormStaff}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Deskripsi kategori produk..."
                      autoComplete="off"
                      className="min-h-20"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Tabs
                className={"w-full col-span-full"}
                value={formatValue(formType as string | undefined)}
                onValueChange={(v: string | undefined) =>
                  form.setValue(
                    "tipe_kondisi_tambahan",
                    formatValue(v, true) as "TEKS" | "GAMBAR" | undefined,
                  )
                }
              >
                <div className="flex w-full flex-col gap-1 items-center">
                  <Label className="text-xs">Kondisi Tambahan</Label>
                  <div className="w-full flex items-center gap-3">
                    <Separator className={"flex-1"} />
                    <TabsList>
                      <TabsTrigger
                        type="button"
                        value="none"
                        className={
                          "text-xs data-active:text-yellow-600 dark:data-active:text-yellow-400"
                        }
                      >
                        Tidak ada
                      </TabsTrigger>
                      <TabsTrigger
                        type="button"
                        value="text"
                        className={
                          "text-xs data-active:text-yellow-600 dark:data-active:text-yellow-400"
                        }
                      >
                        Teks
                      </TabsTrigger>
                      <TabsTrigger
                        type="button"
                        value="image"
                        className={
                          "text-xs data-active:text-yellow-600 dark:data-active:text-yellow-400"
                        }
                      >
                        Gambar
                      </TabsTrigger>
                    </TabsList>
                    <Separator className={"flex-1"} />
                  </div>
                </div>
                <TabsContent value={"text"}>
                  <Controller
                    name="teks_kondisi"
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
                          Kondisi
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id={`${idFormStaff}-${field.name}`}
                          aria-invalid={fieldState.invalid}
                          placeholder="Keterangan pengondisian..."
                          autoComplete="off"
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </TabsContent>
                <TabsContent value={"image"}>
                  <Controller
                    name="gambar_kondisi"
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
                          Icon Kondisi
                        </FieldLabel>
                        <Dropzone
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.invalid}
                          accept={Object.fromEntries(
                            IMAGE_RULES.mimeTypes.map((m) => [m, []]),
                          )}
                          maxSize={IMAGE_RULES.maxSize}
                          oldValue={detail?.gambar_kondisi_url}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </TabsContent>
              </Tabs>
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

export default DialogFormCategory;
