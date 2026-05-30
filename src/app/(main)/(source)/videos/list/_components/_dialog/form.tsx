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
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVideo, useUpdateVideo } from "../../_api";
import { VideoDetailType } from "../../_api/types";
import { Dropzone } from "@/components/ui/dropzone";
import { Switch } from "@/components/ui/switch";
import { useGetVideoCategorySelect } from "@/app/(main)/(source)/videos/categories/_api";

const formSchema = z.object({
  judul_id: z.string().min(3, "Judul ID harus memiliki minimal 3 karakter"),
  judul_en: z.string().min(3, "Judul EN harus memiliki minimal 3 karakter"),
  deskripsi_id: z
    .string()
    .min(3, "Deskripsi ID harus memiliki minimal 3 karakter"),
  deskripsi_en: z
    .string()
    .min(3, "Deskripsi EN harus memiliki minimal 3 karakter"),
  kategori_id: z.string().min(1, "Kategori wajib dipilih"),
  is_active: z.boolean(),
  video_file: z.array(z.file()).optional(),
  thumbnail_file: z.array(z.file()).optional(),
});

export const DialogFormVideo = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  detail?: VideoDetailType;
  isDisabled?: boolean;
}) => {
  const idForm = useId();
  const isCreate = mode === "create";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      judul_id: detail?.judul_id ?? "",
      judul_en: detail?.judul_en ?? "",
      deskripsi_id: detail?.deskripsi_id ?? "",
      deskripsi_en: detail?.deskripsi_en ?? "",
      kategori_id: detail?.kategori_id ?? "",
      is_active: detail?.is_active ?? false,
      video_file: [],
      thumbnail_file: [],
    },
  });

  const { mutate: createVideo, isPending: isCreating } = useCreateVideo();
  const { mutate: updateVideo, isPending: isUpdating } = useUpdateVideo();
  const { data: categoriesSelect } = useGetVideoCategorySelect();

  const categories = categoriesSelect?.data ?? [];
  const isLoading = isCreating || isUpdating || isDisabled;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const body = new FormData();
    body.append("judul_id", values.judul_id);
    body.append("judul_en", values.judul_en);
    body.append("deskripsi_id", values.deskripsi_id);
    body.append("deskripsi_en", values.deskripsi_en);
    body.append("kategori_id", values.kategori_id);
    body.append("is_active", String(values.is_active));

    if (values.video_file && values.video_file.length > 0) {
      body.append("video_file", values.video_file[0]);
    }

    if (values.thumbnail_file && values.thumbnail_file.length > 0) {
      body.append("thumbnail_file", values.thumbnail_file[0]);
    }

    if (isCreate) {
      createVideo({ body }, { onSuccess: () => handleClose() });
      return;
    }

    updateVideo(
      { body, params: { id: detail?.id ?? "" } },
      { onSuccess: () => handleClose() },
    );
  };

  useEffect(() => {
    if (!open) handleClose();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Ubah Data Video" : "Tambah Video Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi video"
              : "Tambahkan video baru"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {mode === "edit" && !detail ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <FieldGroup className="grid md:grid-cols-2 gap-4 max-h-[70vh] overflow-auto pr-1">
              <Controller
                name="judul_id"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required htmlFor={`${idForm}-${field.name}`}>
                      Judul (ID)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idForm}-${field.name}`}
                      placeholder="Judul Indonesia..."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="judul_en"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required htmlFor={`${idForm}-${field.name}`}>
                      Judul (EN)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idForm}-${field.name}`}
                      placeholder="English title..."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="kategori_id"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel required>Kategori</FieldLabel>
                    <select
                      className="h-8 rounded-md border bg-background px-2 text-sm"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={field.disabled}
                    >
                      <option value="">Pilih kategori...</option>
                      {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item?.nama?.id ?? "-"}
                        </option>
                      ))}
                    </select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="deskripsi_id"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel required>Deskripsi (ID)</FieldLabel>
                    <Textarea {...field} className="min-h-24" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="deskripsi_en"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel required>Deskripsi (EN)</FieldLabel>
                    <Textarea {...field} className="min-h-24" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="video_file"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel required={isCreate}>File Video</FieldLabel>
                    <Input
                      id={`${idForm}-${field.name}`}
                      type="file"
                      accept="video/*"
                      disabled={field.disabled}
                      onChange={(e) =>
                        field.onChange(Array.from(e.target.files ?? []))
                      }
                    />
                    {!!detail?.video_url && (
                      <a
                        href={detail.video_url}
                        target="_blank"
                        className="text-xs text-primary underline"
                        rel="noreferrer"
                      >
                        Lihat video saat ini
                      </a>
                    )}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="thumbnail_file"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel>Thumbnail</FieldLabel>
                    <Dropzone
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      ratio="hero"
                      oldValue={detail?.thumbnail_url}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="is_active"
                control={form.control}
                disabled={isLoading}
                render={({ field }) => (
                  <Field className="gap-1 col-span-full">
                    <FieldLabel>Publish</FieldLabel>
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
