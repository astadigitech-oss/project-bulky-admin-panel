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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import ID from "country-flag-icons/react/1x1/ID";
import GB from "country-flag-icons/react/1x1/GB";
import { useCreateSource, useUpdateSource } from "../../_api";
import { SourcePartIType, SourceType } from "../../_api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  nama_id: z.string().min(3, "Nama ID harus memiliki minimal 3 karakter"),
  nama_en: z.string().min(3, "Nama EN harus memiliki minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi harus memiliki minimal 3 karakter"),
});

const DialogFormSource = ({
  open,
  onOpenChange,
  mode,
  detail,
  isDisabled,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  detail?: SourceType & SourcePartIType;
  isDisabled?: boolean;
}) => {
  const idFormSourceProduct = useId();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      nama_id: detail?.nama.id ?? "",
      nama_en: detail?.nama.en ?? "",
      deskripsi: detail?.deskripsi ?? "",
    },
  });

  const { mutate: createSource, isPending: isCreating } = useCreateSource();
  const { mutate: updateSource, isPending: isUpdating } = useUpdateSource();

  const isLoading = isCreating || isUpdating || isDisabled;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    switch (mode) {
      case "create":
        createSource({ body: values }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        updateSource(
          { body: values, params: { id: detail?.id ?? "" } },
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
              ? "Ubah Data Sumber Produk"
              : "Tambah Sumber Produk Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Kelola informasi sumber produk"
              : "Tambahkan sumber produk baru"}
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
                        htmlFor={`${idFormSourceProduct}-${field.name}`}
                      >
                        Nama
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={`${idFormSourceProduct}-${field.name}`}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          placeholder="Nama sumber..."
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
                          id={`${idFormSourceProduct}-${field.name}`}
                          type="text"
                          aria-invalid={fieldState.invalid}
                          placeholder="Source name..."
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
                      htmlFor={`${idFormSourceProduct}-${field.name}`}
                    >
                      Deskripsi
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={`${idFormSourceProduct}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Deskripsi sumber produk..."
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

export default DialogFormSource;
