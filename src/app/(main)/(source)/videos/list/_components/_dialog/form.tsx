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
import { Send, Upload, X } from "lucide-react";
import { ComponentProps, useEffect, useId, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { generateSlug } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useCreateVideo, useUpdateVideo } from "../../_api";
import { VideoDetailType } from "../../_api/types";
import { Dropzone } from "@/components/ui/dropzone";
import { Switch } from "@/components/ui/switch";
import { useGetVideoCategorySelect } from "@/app/(main)/(source)/videos/categories/_api";
import axios from "axios";
import { getCookie } from "cookies-next/client";
import { apiUrl } from "@/config";
import { toast } from "sonner";

const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB per chunk

const formSchema = z.object({
  judul_id: z.string().min(3, "Judul ID harus memiliki minimal 3 karakter"),
  judul_en: z.string().min(3, "Judul EN harus memiliki minimal 3 karakter"),
  slug_id: z.string().optional(),
  slug_en: z.string().optional(),
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
      slug_id: detail?.slug_id ?? "",
      slug_en: detail?.slug_en ?? "",
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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const abortRef = useRef(false);

  const categories = categoriesSelect?.data ?? [];
  const isLoading = isCreating || isUpdating || isDisabled || uploadProgress !== null;

  const judulId = useWatch({ control: form.control, name: "judul_id" });
  const judulEn = useWatch({ control: form.control, name: "judul_en" });

  useEffect(() => {
    if (mode === "create") {
      form.setValue("slug_id", generateSlug(judulId ?? ""));
    }
  }, [judulId]);

  useEffect(() => {
    if (mode === "create") {
      form.setValue("slug_en", generateSlug(judulEn ?? ""));
    }
  }, [judulEn]);

  const handleClose = () => {
    abortRef.current = true;
    setUploadProgress(null);
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const videoFile = values.video_file?.[0];

    // Chunk upload: dipakai saat create dengan video file
    if (isCreate && videoFile) {
      abortRef.current = false;
      setUploadProgress(0);

      try {
        const uploadId = crypto.randomUUID();
        const ext = videoFile.name.substring(videoFile.name.lastIndexOf("."));
        const totalChunks = Math.ceil(videoFile.size / CHUNK_SIZE);
        const headers = { Authorization: `Bearer ${getCookie("ACCESS_TOKEN")}` };

        for (let i = 0; i < totalChunks; i++) {
          if (abortRef.current) return;

          const start = i * CHUNK_SIZE;
          const chunk = videoFile.slice(start, Math.min(start + CHUNK_SIZE, videoFile.size));

          const chunkForm = new FormData();
          chunkForm.append("upload_id", uploadId);
          chunkForm.append("chunk_index", String(i));
          chunkForm.append("total_chunks", String(totalChunks));
          chunkForm.append("chunk_data", chunk);

          await axios.post(`${apiUrl}/video/upload-chunk`, chunkForm, { headers });
          setUploadProgress(Math.round(((i + 1) / totalChunks) * 90));
        }

        if (abortRef.current) return;
        setUploadProgress(95);

        const finalForm = new FormData();
        finalForm.append("upload_id", uploadId);
        finalForm.append("total_chunks", String(totalChunks));
        finalForm.append("original_ext", ext);
        finalForm.append("judul_id", values.judul_id);
        finalForm.append("judul_en", values.judul_en);
        finalForm.append("slug_id", values.slug_id ?? "");
        finalForm.append("slug_en", values.slug_en ?? "");
        finalForm.append("deskripsi_id", values.deskripsi_id);
        finalForm.append("deskripsi_en", values.deskripsi_en);
        finalForm.append("kategori_id", values.kategori_id);
        finalForm.append("is_active", String(values.is_active));
        if (values.thumbnail_file?.[0]) {
          finalForm.append("thumbnail_file", values.thumbnail_file[0]);
        }

        await axios.post(`${apiUrl}/video/finalize-chunk`, finalForm, { headers });

        toast.success("Video berhasil diupload dan sedang diproses");
        handleClose();
      } catch {
        toast.error("Gagal mengupload video. Silakan coba lagi.");
      } finally {
        setUploadProgress(null);
      }
      return;
    }

    // Upload biasa (update, atau create tanpa video file)
    const body = new FormData();
    body.append("judul_id", values.judul_id);
    body.append("judul_en", values.judul_en);
    body.append("slug_id", values.slug_id ?? "");
    body.append("slug_en", values.slug_en ?? "");
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
              {/* Upload video & thumbnail — paling atas, 2 kolom */}
              <Controller
                name="video_file"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => {
                  const selectedFile = field.value?.[0];
                  const previewUrl = selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : null;
                  return (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1"
                    >
                      <FieldLabel required={isCreate}>File Video</FieldLabel>
                      {previewUrl ? (
                        <div className="flex flex-col gap-2">
                          <video
                            src={previewUrl}
                            controls
                            className="w-full rounded-md border border-gray-300 dark:border-gray-300/50 max-h-52 object-contain bg-black"
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                            <span className="truncate max-w-[80%]">{selectedFile?.name}</span>
                            <span>{((selectedFile?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={field.disabled}
                            onClick={() => field.onChange([])}
                          >
                            <X className="size-3.5" />
                            Ganti Video
                          </Button>
                        </div>
                      ) : (
                        <label
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 w-full border rounded-md p-4 cursor-pointer transition aspect-9/16",
                            "border-gray-300 dark:border-gray-300/50 hover:border-primary",
                            fieldState.invalid && "border-red-500",
                            field.disabled && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <input
                            type="file"
                            accept="video/*"
                            disabled={field.disabled}
                            className="hidden"
                            onChange={(e) =>
                              field.onChange(Array.from(e.target.files ?? []))
                            }
                          />
                          <Upload className="size-8 text-muted-foreground" />
                          <div className="flex flex-col items-center text-sm">
                            <span>Klik untuk pilih file video</span>
                            <span className="text-xs text-muted-foreground">Rekomendasi ratio 9:16 (MP4, MOV, AVI, WEBM, dll.) </span>
                          </div>
                          {!!detail?.video_url && (
                            <a
                              href={detail.video_url}
                              target="_blank"
                              className="text-xs text-primary underline"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Lihat video saat ini
                            </a>
                          )}
                        </label>
                      )}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="thumbnail_file"
                control={form.control}
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1"
                  >
                    <FieldLabel>Thumbnail (9:16)</FieldLabel>
                    <Dropzone
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      ratio="portrait"
                      oldValue={detail?.thumbnail_url}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

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
                name="slug_id"
                control={form.control}
                disabled={isLoading}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel htmlFor={`${idForm}-${field.name}`}>
                      Slug (ID)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idForm}-${field.name}`}
                      placeholder="Otomatis dari Judul ID..."
                      autoComplete="off"
                    />
                  </Field>
                )}
              />

              <Controller
                name="slug_en"
                control={form.control}
                disabled={isLoading}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel htmlFor={`${idForm}-${field.name}`}>
                      Slug (EN)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idForm}-${field.name}`}
                      placeholder="Auto-generated from Title EN..."
                      autoComplete="off"
                    />
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
              {uploadProgress !== null
                ? `Mengupload ${uploadProgress}%...`
                : isLoading
                  ? "Mengirim..."
                  : "Kirim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
