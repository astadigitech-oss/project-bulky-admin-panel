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
import dynamic from "next/dynamic";
import { useCreateBlog, useUpdateBlog } from "../../_api";
import { BlogDetailType } from "../../_api/types";
import { Dropzone } from "@/components/ui/dropzone";
import { useGetBlogCategorySelect } from "@/app/(main)/(source)/blogs/categories/_api";
import { useGetTagBlogSelect } from "@/app/(main)/(source)/blogs/tags/_api";
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
import { Switch } from "@/components/ui/switch";

const Editor = dynamic(() => import("@/components/blocks/editor-00/editor"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-40" />,
});

const formSchema = z.object({
  judul_id: z.string().min(3, "Judul ID harus memiliki minimal 3 karakter"),
  judul_en: z.string().min(3, "Judul EN harus memiliki minimal 3 karakter"),
  slug_id: z.string().optional(),
  slug_en: z.string().optional(),
  konten_id: z.string().min(3, "Konten ID wajib diisi"),
  konten_en: z.string().min(3, "Konten EN wajib diisi"),
  kategori_id: z.string().min(1, "Kategori wajib dipilih"),
  label_ids: z.array(z.string()).optional(),
  highlight_id: z.string().optional(),
  highlight_en: z.string().optional(),
  is_active: z.boolean(),
  featured_image: z.array(z.file()).optional(),
});

export const DialogFormBlog = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  detail?: BlogDetailType;
  isDisabled?: boolean;
}) => {
  const idForm = useId();
  const anchor = useComboboxAnchor();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      judul_id: detail?.judul_id ?? "",
      judul_en: detail?.judul_en ?? "",
      slug_id: detail?.slug_id ?? "",
      slug_en: detail?.slug_en ?? "",
      konten_id: detail?.konten_id ?? "",
      konten_en: detail?.konten_en ?? "",
      kategori_id: detail?.kategori_id ?? "",
      label_ids: [],
      highlight_id: detail?.highlight_id ?? "",
      highlight_en: detail?.highlight_en ?? "",
      is_active: detail?.is_active ?? false,
      featured_image: [],
    },
  });

  const { mutate: createBlog, isPending: isCreating } = useCreateBlog();
  const { mutate: updateBlog, isPending: isUpdating } = useUpdateBlog();

  const { data: categorySelect } = useGetBlogCategorySelect();
  const { data: labelSelect } = useGetTagBlogSelect();

  const categories = Array.isArray(categorySelect?.data)
    ? categorySelect?.data
    : ((categorySelect?.data as any)?.kategori ?? []);

  const labels = labelSelect?.data ?? [];

  const isLoading = isCreating || isUpdating || isDisabled;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const body = new FormData();
    body.append("judul_id", values.judul_id);
    body.append("judul_en", values.judul_en);
    body.append("slug_id", values.slug_id ?? "");
    body.append("slug_en", values.slug_en ?? "");
    body.append("konten_id", values.konten_id);
    body.append("konten_en", values.konten_en);
    body.append("kategori_id", values.kategori_id);
    body.append("highlight_id", values.highlight_id ?? "");
    body.append("highlight_en", values.highlight_en ?? "");
    body.append("is_active", String(values.is_active));

    (values.label_ids ?? []).forEach((id) => body.append("label_ids", id));

    if (values.featured_image && values.featured_image.length > 0) {
      body.append("featured_image", values.featured_image[0]);
    }

    switch (mode) {
      case "create":
        createBlog({ body }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        updateBlog(
          { body, params: { id: detail?.id ?? "" } },
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
      <DialogContent showCloseButton={false} className="md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Ubah Data Berita" : "Tambah Berita Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi berita"
              : "Tambahkan berita baru"}
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
                name="featured_image"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel required>Featured Image</FieldLabel>
                    <Dropzone
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      ratio="hero"
                      oldValue={detail?.featured_image_url}
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
                disabled={isDisabled}
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
                disabled={isDisabled}
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
                disabled={isDisabled}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel htmlFor={`${idForm}-${field.name}`}>
                      Slug (ID)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idForm}-${field.name}`}
                      placeholder="Kosongkan untuk auto-generate"
                    />
                  </Field>
                )}
              />

              <Controller
                name="slug_en"
                control={form.control}
                disabled={isDisabled}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel htmlFor={`${idForm}-${field.name}`}>
                      Slug (EN)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${idForm}-${field.name}`}
                      placeholder="Leave empty for auto-generate"
                    />
                  </Field>
                )}
              />

              <Controller
                name="kategori_id"
                control={form.control}
                disabled={isDisabled}
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
                      {categories.map((item: any) => (
                        <option key={item.id} value={item.id}>
                          {item?.nama?.id ?? item?.nama_id ?? "-"}
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
                name="label_ids"
                control={form.control}
                disabled={isDisabled}
                render={({ field }) => (
                  <Field className="gap-1 col-span-full">
                    <FieldLabel>Label</FieldLabel>
                    <Combobox
                      multiple
                      autoHighlight
                      items={labels}
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
                                    labels.find((i: any) => i.id === value)
                                      ?.nama?.id
                                  }
                                </ComboboxChip>
                              ))}
                            </>
                          )}
                        </ComboboxValue>
                        <ComboboxChipsInput placeholder="Pilih label..." />
                      </ComboboxChips>
                      <ComboboxContent anchor={anchor}>
                        <ComboboxEmpty>Tidak ada data.</ComboboxEmpty>
                        <ComboboxList>
                          {labels.map((item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {item.nama?.id}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />

              <Controller
                name="konten_id"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel required>Konten (ID)</FieldLabel>
                    <Editor
                      key={`konten-id-${detail?.id ?? "new"}`}
                      placeholder="Konten Indonesia..."
                      initialHtml={field.value}
                      onHtmlChangeAction={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="konten_en"
                control={form.control}
                disabled={isDisabled}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-full"
                  >
                    <FieldLabel required>Konten (EN)</FieldLabel>
                    <Editor
                      key={`konten-en-${detail?.id ?? "new"}`}
                      placeholder="English content..."
                      initialHtml={field.value}
                      onHtmlChangeAction={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="highlight_id"
                control={form.control}
                disabled={isDisabled}
                render={({ field }) => (
                  <Field className="gap-1 col-span-full">
                    <FieldLabel>Highlight (ID)</FieldLabel>
                    <Textarea {...field} className="min-h-20" />
                  </Field>
                )}
              />

              <Controller
                name="highlight_en"
                control={form.control}
                disabled={isDisabled}
                render={({ field }) => (
                  <Field className="gap-1 col-span-full">
                    <FieldLabel>Highlight (EN)</FieldLabel>
                    <Textarea {...field} className="min-h-20" />
                  </Field>
                )}
              />

              <Controller
                name="is_active"
                control={form.control}
                disabled={isDisabled}
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
