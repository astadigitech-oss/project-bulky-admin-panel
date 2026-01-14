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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, X } from "lucide-react";
import { ComponentProps, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  CreateTaxBody,
  TaxDetailResponse,
  UpdateTaxBody,
} from "../../_api/data";
import { useCreateTax, useUpdateTax } from "../../_api";
import { Spinner } from "@/components/ui/spinner";
import { numericString } from "@/lib/utils";

const formSchema = z.object({
  persentase: z
    .string()
    .min(1, "Persentase wajib diisi")
    .refine(
      (e) => !e || Number.parseFloat(e) > 0,
      "Persentase harus lebih dari 0",
    ),
  is_active: z.boolean(),
});

export const DialogFormTax = ({
  open,
  onOpenChange,
  mode,
  detail,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | null;
  detail?: TaxDetailResponse["data"];
}) => {
  const idFormStaff = useId();

  const { mutate: createTax, isPending: isCreating } = useCreateTax();
  const { mutate: updateTax, isPending: isUpdating } = useUpdateTax();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      persentase: detail?.persentase?.toString() ?? "0",
      is_active: detail?.is_active ?? true,
    },
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    switch (mode) {
      case "create":
        const bodyCreate: CreateTaxBody = {
          persentase: Number.parseFloat(values.persentase),
          is_active: values.is_active,
        };
        createTax({ body: bodyCreate }, { onSuccess: () => handleClose() });
        break;
      case "edit":
        const bodyEdit: UpdateTaxBody = {
          persentase: Number.parseFloat(values.persentase),
          is_active: values.is_active,
        };
        updateTax(
          { body: bodyEdit, params: { id: detail?.id ?? "" } },
          { onSuccess: () => handleClose() },
        );
        break;
    }
  };

  const isDisabled = isCreating || isUpdating;

  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Ubah Data PPN" : "Tambah PPN Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Kelola informasi PPN" : "Tambahkan PPN Baru"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="grid md:grid-cols-6 gap-4">
            <Controller
              name="persentase"
              control={form.control}
              disabled={isDisabled}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel required htmlFor={`${idFormStaff}-${field.name}`}>
                    Persentase (%)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${idFormStaff}-${field.name}`}
                    type="number"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) =>
                      field.onChange(numericString(e.target.value))
                    }
                    placeholder="11"
                    autoComplete="off"
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
              disabled={detail?.is_active ?? isDisabled}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <Switch
                    id={`${idFormStaff}-${field.name}`}
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    disabled={field.disabled}
                    className={
                      "data-checked:bg-emerald-500 data-unchecked:bg-red-500 dark:data-checked:bg-emerald-400 dark:data-unchecked:bg-red-400"
                    }
                    classThumb="data-checked:bg-emerald-50 data-unchecked:bg-red-50 dark:data-checked:bg-emerald-950 dark:data-unchecked:bg-red-950"
                    size="sm"
                  />
                  <FieldLabel
                    htmlFor={`${idFormStaff}-${field.name}`}
                    className="whitespace-nowrap"
                  >
                    Status PPN
                  </FieldLabel>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button
              disabled={isDisabled}
              type="button"
              variant={"outline"}
              onClick={handleClose}
            >
              <X className="size-3.5" />
              Batal
            </Button>
            <Button disabled={isDisabled} type="submit">
              {isDisabled ? (
                <Spinner className="size-3.5" />
              ) : (
                <Send className="size-3.5" />
              )}
              {isDisabled ? "Mengirim..." : "Kirim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
