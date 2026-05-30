"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Eye, Newspaper, Send, X } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import { useCreateBlog, useGetBlogDetail, useUpdateBlog } from "../../_api";
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
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Editor: any = dynamic(
  () => import("@/components/blocks/editor-00/editor"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-40" />,
  },
);

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

const getTextLabel = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.id === "string") return obj.id;
    if (typeof obj.en === "string") return obj.en;
  }
  return "-";
};

export const BlogFormPageClient = () => {
  const idForm = useId();
  const params = useParams();
  const router = useRouter();
  const anchor = useComboboxAnchor();

  const blogId = String(params.blogId ?? "");
  const isCreate = blogId === "create";

  const [contentState, setContentState] = useState("id");

  const { data: detail, isLoading: isLoadingDetail } = useGetBlogDetail({
    id: isCreate ? undefined : blogId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      judul_id: detail?.data.judul_id ?? "",
      judul_en: detail?.data.judul_en ?? "",
      slug_id: detail?.data.slug_id ?? "",
      slug_en: detail?.data.slug_en ?? "",
      konten_id: detail?.data.konten_id ?? "",
      konten_en: detail?.data.konten_en ?? "",
      kategori_id: detail?.data.kategori_id ?? "",
      label_ids: [],
      highlight_id: detail?.data.highlight_id ?? "",
      highlight_en: detail?.data.highlight_en ?? "",
      is_active: detail?.data.is_active ?? false,
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

  const isLoading = isCreating || isUpdating;

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

    if (isCreate) {
      createBlog({ body }, { onSuccess: () => router.push("/blogs/list") });
      return;
    }

    updateBlog(
      { body, params: { id: detail?.data.id ?? blogId } },
      { onSuccess: () => router.push("/blogs/list") },
    );
  };

  const kontenId = useWatch({ control: form.control, name: "konten_id" });
  const kontenEn = useWatch({ control: form.control, name: "konten_en" });

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center gap-2">
        <Link href="/blogs/list">
          <Button variant="ghost" size="icon-lg">
            <Newspaper className="size-5" />
          </Button>
        </Link>
        <ChevronRight className="size-4" />
        <h1 className="leading-none font-semibold text-2xl">
          {isCreate ? "Tambah" : "Edit"} Berita
        </h1>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {isLoadingDetail && !isCreate ? (
          <Skeleton className="w-full h-64" />
        ) : (
          <FieldGroup className="grid md:grid-cols-2 gap-4">
            <Controller
              name="featured_image"
              control={form.control}
              disabled={isLoading}
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
                    oldValue={detail?.data.featured_image_url}
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
                    placeholder="Kosongkan untuk auto-generate"
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
                    placeholder="Leave empty for auto-generate"
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
                    {categories.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {getTextLabel(item?.nama ?? item?.nama_id)}
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
              disabled={isLoading}
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
                        {(values: string[]) => (
                          <>
                            {values.map((value: any) => (
                              <ComboboxChip key={value}>
                                {getTextLabel(
                                  labels.find((i: any) => i.id === value)?.nama,
                                )}
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
                            {getTextLabel(item?.nama)}
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
              disabled={isLoading}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel required>Konten (ID)</FieldLabel>
                  <Editor
                    key={`konten-id-${detail?.data.id ?? "new"}`}
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
              disabled={isLoading}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel required>Konten (EN)</FieldLabel>
                  <Editor
                    key={`konten-en-${detail?.data.id ?? "new"}`}
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
              disabled={isLoading}
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
              disabled={isLoading}
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

        <div className="flex justify-end w-full items-center gap-3">
          <Dialog>
            <DialogTrigger
              render={
                <Button type="button" variant="outline" disabled={isLoading}>
                  <Eye className="size-3.5" />
                  Preview Konten
                </Button>
              }
            />
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Preview Konten Berita</DialogTitle>
              </DialogHeader>
              <Tabs value={contentState} onValueChange={setContentState}>
                <TabsList>
                  <TabsTrigger value="id">Konten (ID)</TabsTrigger>
                  <TabsTrigger value="en">Konten (EN)</TabsTrigger>
                </TabsList>
                <TabsContent value="id">
                  <div
                    className="rounded-md border bg-background p-4 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: kontenId || "<p>-</p>" }}
                  />
                </TabsContent>
                <TabsContent value="en">
                  <div
                    className="rounded-md border bg-background p-4 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: kontenEn || "<p>-</p>" }}
                  />
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <DialogClose
                  render={
                    <Button type="button" variant="outline">
                      Tutup
                    </Button>
                  }
                />
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            disabled={isLoading}
            type="button"
            variant="outline"
            onClick={() => router.push("/blogs/list")}
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
        </div>
      </form>
    </div>
  );
};
