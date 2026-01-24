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
import {
  ComponentProps,
  Dispatch,
  SetStateAction,
  useEffect,
  useId,
} from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Dropzone } from "@/components/ui/dropzone";
import {
  useCreateBannerTypeProduct,
  useUpdateBannerTypeProduct,
} from "../../_api";
import {
  BannerTypeProductResponseType,
  ListTypeProductType,
} from "../../_api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const IMAGE_RULES = {
  mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSize: 10 * 1024 * 1024, // 10MB
};

const formSchema = z.object({
  nama: z.string().min(3, "Nama harus memiliki minimal 3 karakter"),
  tipe_produk_id: z.string().min(1, "Wajib memilih jenis produk"),
});

export const DialogFormBannerTypeProduct = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
  typeProductList,
  setAccordionValue,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  typeProductList: ListTypeProductType[];
  setAccordionValue: Dispatch<SetStateAction<string[]>>;
  mode?: "create" | "edit";
  detail?: BannerTypeProductResponseType;
  isDisabled?: boolean;
}) => {
  const idFormStaff = useId();
  const finalSchema = formSchema.extend({
    file:
      mode === "create"
        ? z
            .array(
              z
                .file()
                .max(IMAGE_RULES.maxSize, "Ukuran maksimal 10MB")
                .mime(IMAGE_RULES.mimeTypes),
            )
            .min(1, "Logo wajib diunggah")
            .max(1, "Hanya boleh 1 file")
        : z
            .array(
              z
                .file()
                .max(IMAGE_RULES.maxSize, "Ukuran maksimal 10MB")
                .mime(IMAGE_RULES.mimeTypes),
            )
            .max(1, "Hanya boleh 1 file"),
  });

  const form = useForm<z.infer<typeof finalSchema>>({
    resolver: zodResolver(finalSchema),
    values: {
      nama: detail?.nama ?? "",
      file: [],
      tipe_produk_id: detail?.tipe_produk.id ?? "",
    },
  });

  const { mutate: createBannerTypeProduct, isPending: isCreating } =
    useCreateBannerTypeProduct();
  const { mutate: updateBannerTypeProduct, isPending: isUpdating } =
    useUpdateBannerTypeProduct();

  const isLoading = isCreating || isUpdating || isDisabled;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof finalSchema>) => {
    const body = new FormData();
    body.append("nama", values.nama);
    body.append("tipe_produk_id", values.tipe_produk_id);
    if (values.file.length > 0) {
      body.append("file", values.file[0]);
    }
    switch (mode) {
      case "create":
        createBannerTypeProduct(
          { body: body },
          {
            onSuccess: ({ data }) => {
              handleClose();
              setAccordionValue([data.data.tipe_produk.slug]);
            },
          },
        );
        break;
      case "edit":
        updateBannerTypeProduct(
          { body: body, params: { id: detail?.id ?? "" } },
          {
            onSuccess: ({ data }) => {
              handleClose();
              setAccordionValue([data.data.tipe_produk.slug]);
            },
          },
        );
        break;
    }
  };

  useEffect(() => {
    if (!open) handleClose();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={"min-w-2xl"}>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Ubah Data Banner" : "Tambah Banner Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi banner"
              : "Tambahkan banner baru"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {mode === "edit" && !detail ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <FieldGroup className="grid md:grid-cols-6 gap-4">
              <Controller
                name="file"
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
                      Banner
                    </FieldLabel>
                    <Dropzone
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      ratio="banner"
                      accept={Object.fromEntries(
                        IMAGE_RULES.mimeTypes.map((m) => [m, []]),
                      )}
                      maxSize={IMAGE_RULES.maxSize}
                      oldValue={detail?.gambar_url}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="grid grid-cols-2 gap-6 col-span-full">
                <Controller
                  name="nama"
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
                        Nama
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${idFormStaff}-${field.name}`}
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
                <Controller
                  name="tipe_produk_id"
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
                        Tipe Produk
                      </FieldLabel>
                      <Select
                        items={typeProductList.map((item) => ({
                          value: item.id,
                          label: item.nama,
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={field.disabled}
                        data-invalid={fieldState.invalid}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={"Pilih tipe produk..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {typeProductList.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
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
