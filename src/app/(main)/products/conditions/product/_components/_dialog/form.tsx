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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import ID from "country-flag-icons/react/1x1/ID";
import GB from "country-flag-icons/react/1x1/GB";
import {
  useCreateProductCondition,
  useUpdateProductCondition,
} from "../../_api";
import {
  ProductConditionPartIType,
  ProductConditionType,
} from "../../_api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateSlug } from "@/lib/utils";

const formSchema = z.object({
  nama_id: z.string().min(3, "Nama ID harus memiliki minimal 3 karakter"),
  nama_en: z.string().min(3, "Nama EN harus memiliki minimal 3 karakter"),
  slug_id: z.string().optional(),
  slug_en: z.string().optional(),
  deskripsi: z.string().nullable().optional(),
});

const DialogFormProductCondition = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  detail?: ProductConditionType & ProductConditionPartIType;
  isDisabled?: boolean;
}) => {
  const idFormProductCondition = useId();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      nama_id: detail?.nama.id ?? "",
      nama_en: detail?.nama.en ?? "",
      slug_id: detail?.slug_id ?? detail?.slug ?? "",
      slug_en: detail?.slug_en ?? "",
      deskripsi: detail?.deskripsi ?? "",
    },
  });

  const { mutate: createProductCondition, isPending: isCreating } =
    useCreateProductCondition();
  const { mutate: updateProductCondition, isPending: isUpdating } =
    useUpdateProductCondition();

  const isLoading = isCreating || isUpdating || isDisabled;

  const namaId = useWatch({ control: form.control, name: "nama_id" });
  const namaEn = useWatch({ control: form.control, name: "nama_en" });

  useEffect(() => {
    if (mode === "create") {
      form.setValue("slug_id", generateSlug(namaId ?? ""));
    }
  }, [namaId]);

  useEffect(() => {
    if (mode === "create") {
      form.setValue("slug_en", generateSlug(namaEn ?? ""));
    }
  }, [namaEn]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      ...values,
      deskripsi: values.deskripsi?.trim() ? values.deskripsi.trim() : null,
    };

    switch (mode) {
      case "create":
        createProductCondition(
          { body: payload },
          { onSuccess: () => handleClose() },
        );
        break;
      case "edit":
        updateProductCondition(
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
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? "Ubah Data Kondisi Paket Produk"
              : "Tambah Kondisi Paket Produk Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi kondisi paket produk"
              : "Tambahkan kondisi paket produk baru"}
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
                        htmlFor={`${idFormProductCondition}-${field.name}`}
                      >
                        Nama
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={`${idFormProductCondition}-${field.name}`}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          placeholder="Nama kondisi paket..."
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
                          id={`${idFormProductCondition}-${field.name}`}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          placeholder="Package condition name..."
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
              <div className="grid grid-cols-2 gap-2 col-span-full">
                <Controller
                  name="slug_id"
                  control={form.control}
                  disabled={isDisabled}
                  render={({ field }) => (
                    <Field className="gap-1">
                      <FieldLabel htmlFor={`${idFormProductCondition}-${field.name}`}>
                        Slug (ID)
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${idFormProductCondition}-${field.name}`}
                        placeholder="Otomatis dari Nama ID..."
                        autoComplete="off"
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
                      <FieldLabel htmlFor={`${idFormProductCondition}-${field.name}`}>
                        Slug (EN)
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${idFormProductCondition}-${field.name}`}
                        placeholder="Auto-generated from Name EN..."
                        autoComplete="off"
                      />
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
                      htmlFor={`${idFormProductCondition}-${field.name}`}
                    >
                      Deskripsi
                    </FieldLabel>
                    <Textarea
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value ?? ""}
                      id={`${idFormProductCondition}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Deskripsi kondisi paket..."
                      autoComplete="off"
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

export default DialogFormProductCondition;
