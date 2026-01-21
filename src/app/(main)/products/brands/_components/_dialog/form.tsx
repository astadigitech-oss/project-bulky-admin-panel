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
import { Dropzone } from "@/components/ui/dropzone";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import ID from "country-flag-icons/react/1x1/ID";
import GB from "country-flag-icons/react/1x1/GB";
import { useCreateBrand, useUpdateBrand } from "../../_api";
import { BrandType } from "../../_api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export const IMAGE_RULES = {
  mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSize: 10 * 1024 * 1024, // 10MB
};

const formSchema = z.object({
  nama_id: z.string().min(3, "Nama harus memiliki minimal 3 karakter"),
  nama_en: z.string().min(3, "Nama harus memiliki minimal 3 karakter"),
  logo: z
    .array(
      z
        .file()
        .max(IMAGE_RULES.maxSize, "Ukuran maksimal 10MB")
        .mime(IMAGE_RULES.mimeTypes),
    )
    .min(1, "Logo wajib diunggah")
    .max(1, "Hanya boleh 1 file"),
});

const DialogFormBrand = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  detail?: BrandType;
  isDisabled?: boolean;
}) => {
  const idFormStaff = useId();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      nama_id: detail?.nama.id ?? "",
      nama_en: detail?.nama.en ?? "",
      logo: [],
    },
  });

  const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();

  const isLoading = isCreating || isUpdating || isDisabled;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    switch (mode) {
      case "create":
        const bodyCreate = new FormData();
        bodyCreate.append("nama_id", values.nama_id);
        bodyCreate.append("nama_en", values.nama_en);
        if (values.logo.length > 0) {
          bodyCreate.append("logo", values.logo[0]);
        }
        createBrand({ body: bodyCreate }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        const bodyUpdate = new FormData();
        bodyUpdate.append("nama_id", values.nama_id);
        bodyUpdate.append("nama_en", values.nama_en);
        if (values.logo.length > 0) {
          bodyUpdate.append("logo", values.logo[0]);
        }
        updateBrand(
          { body: bodyUpdate, params: { id: detail?.id ?? "" } },
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
            <FieldGroup className="grid md:grid-cols-6 gap-4">
              <Controller
                name="logo"
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
                      Logo
                    </FieldLabel>
                    <Dropzone
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.invalid}
                      accept={Object.fromEntries(
                        IMAGE_RULES.mimeTypes.map((m) => [m, []]),
                      )}
                      maxSize={IMAGE_RULES.maxSize}
                      oldValue={detail?.logo_url}
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
                          placeholder="Brand name..."
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

export default DialogFormBrand;
