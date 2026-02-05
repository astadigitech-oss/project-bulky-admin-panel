import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipText } from "@/providers/tooltip-provider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { cn, formatRupiah, numericString } from "@/lib/utils";
import { UseQueryResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { WholesalerMarketingAnggaranResponse } from "../../_api/types";
import z from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  useCreateWholesalerAnggaran,
  useDeleteWholesalerAnggaran,
  useReorderWholesalerAnggaran,
  useUpdateWholesalerAnggaran,
} from "../../_api";
import { useConfirm } from "@/hooks/use-confirm";
import { LoadingData } from "./loading-data";
import { EmptyData } from "./empty-data";
import { ItemData } from "./item-data";

const formSchema = z.object({
  minimum: z.string().min(4, "Nominal minimal 1000"),
  maximum: z.string().min(4, "Nominal minimal 1000"),
});

const MIN_TYPE_CYCLE = {
  nominal: "less",
  less: "more",
  more: "nominal",
} as const;

const MIN_TYPE_LABEL = {
  nominal: { min: "Minimum", max: "Maximum" },
  less: { min: "Simbol", max: "Nominal" },
  more: { min: "Simbol", max: "Nominal" },
} as const;

const MIN_TYPE_ICON = {
  less: <ChevronLeft className="size-3.5" />,
  more: <ChevronRight className="size-3.5" />,
  nominal: <p className="text-xs">Rp</p>,
};

const MIN_TYPE_VALUE = {
  nominal: "0",
  less: "Lebih kecil dari",
  more: "Lebih besar dari",
};

export const AnggaranSection = ({
  queryAnggaran,
}: {
  queryAnggaran: UseQueryResult<
    WholesalerMarketingAnggaranResponse,
    AxiosError<unknown, any>
  >;
}) => {
  const [minimumType, setMinimumType] = useState<"nominal" | "less" | "more">(
    "nominal",
  );
  const [dialog, setDialog] = useState<string | null>(null);

  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus [name]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const { mutate: createAnggaran, isPending: isCreating } =
    useCreateWholesalerAnggaran();
  const { mutate: updateAnggaran, isPending: isUpdating } =
    useUpdateWholesalerAnggaran();
  const { mutate: deleteAnggaran, isPending: isDeleting } =
    useDeleteWholesalerAnggaran();
  const { mutate: reorderAnggaran, isPending: isReordering } =
    useReorderWholesalerAnggaran();
  const { data, refetch, isRefetching, isLoading } = queryAnggaran;

  const isDisabled = isCreating || isUpdating || isDeleting || isReordering;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minimum: "0",
      maximum: "0",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!dialog) return;

    const min = Number(values.minimum);
    const max = Number(values.maximum);

    if (minimumType === "nominal") {
      if (max < min) {
        form.setError("maximum", {
          message: "Nominal lebih kecil dari minimum",
        });
        return;
      }

      if (max === min) {
        form.setError("maximum", {
          message: "Nominal tidak boleh sama",
        });
        return;
      }
    }

    const labelMap: Record<typeof minimumType, string> = {
      nominal: `${formatRupiah(values.minimum)} - ${formatRupiah(values.maximum)}`,
      less: `< ${formatRupiah(values.maximum)}`,
      more: `> ${formatRupiah(values.maximum)}`,
    };

    const label = labelMap[minimumType];

    const onSuccess = () => {
      setDialog(null);
      form.reset();
    };

    const payload = { body: { label } };

    if (dialog === "create") {
      createAnggaran(payload, { onSuccess });
    } else {
      updateAnggaran({ ...payload, params: { id: dialog } }, { onSuccess });
    }
  };

  const handleReorder = (id: string, direction: "up" | "down") => {
    reorderAnggaran({ body: { direction }, params: { id } });
  };

  const handleDelete = async (id: string, label: string) => {
    const ok = await confirmDelete(label, "name");
    if (!ok) return;
    deleteAnggaran({ params: { id } });
  };

  const handleClose = () => {
    setDialog(null);
    setMinimumType("nominal");
    form.reset();
  };

  const handleToggleMinimumType = (onChange: (v: string) => void) => {
    const next = MIN_TYPE_CYCLE[minimumType];
    setMinimumType(next);
    onChange(MIN_TYPE_VALUE[next]);
  };

  const handleEdit = (id: string, label?: string) => {
    if (!label) return;
    setDialog(id);
    const isLess = label.split(" ").find((word) => word === "<");
    const isMore = label.split(" ").find((word) => word === ">");
    if (!!isLess || !!isMore) {
      const state = isLess ? "less" : "more";
      setMinimumType(state);
      form.setValue("minimum", MIN_TYPE_VALUE[state]);
      form.setValue("maximum", label.split(/\s*-\s*/)[0].replace(/\D/g, ""));
    }
    if (!isLess && !isMore) {
      setMinimumType("nominal");
      form.setValue("minimum", label.split(/\s*-\s*/)[0].replace(/\D/g, ""));
      form.setValue("maximum", label.split(/\s*-\s*/)[1].replace(/\D/g, ""));
    }
  };

  const minimumNominal = useWatch({
    control: form.control,
    name: "minimum",
  });

  const maximumNominal = useWatch({
    control: form.control,
    name: "maximum",
  });

  return (
    <Card>
      <DialogDelete />
      <Dialog
        open={!!dialog}
        onOpenChange={(e) => {
          if (!e) handleClose();
        }}
      >
        <DialogContent className={"min-w-md"} showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Tambah Anggaran</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-4">
              <FieldGroup className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="minimum"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel>{MIN_TYPE_LABEL[minimumType].min}</FieldLabel>

                      <InputGroup>
                        <InputGroupInput
                          aria-invalid={fieldState.invalid}
                          type={minimumType === "nominal" ? "number" : "text"}
                          readOnly={minimumType !== "nominal"}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(numericString(e.target.value))
                          }
                          onBlur={field.onBlur}
                        />

                        <InputGroupAddon>
                          <InputGroupButton
                            tabIndex={-1}
                            type="button"
                            size="icon-xs"
                            variant="outline"
                            onClick={() =>
                              handleToggleMinimumType(field.onChange)
                            }
                          >
                            {MIN_TYPE_ICON[minimumType]}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="maximum"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel>{MIN_TYPE_LABEL[minimumType].max}</FieldLabel>

                      <InputGroup>
                        <InputGroupInput
                          aria-invalid={fieldState.invalid}
                          type={minimumType === "nominal" ? "number" : "text"}
                          readOnly={minimumType !== "nominal"}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(numericString(e.target.value))
                          }
                          onBlur={field.onBlur}
                        />
                        <InputGroupAddon>
                          <p className="text-xs">Rp</p>
                        </InputGroupAddon>
                      </InputGroup>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <div className="flex items-center justify-center gap-1 h-8 border rounded-md text-xs bg-gray-100">
                {minimumType === "nominal" ? (
                  <p>{formatRupiah(minimumNominal)} -</p>
                ) : (
                  MIN_TYPE_ICON[minimumType]
                )}
                <p>{formatRupiah(maximumNominal)}</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    type="button"
                    onClick={handleClose}
                    variant={"outline"}
                  >
                    Batal
                  </Button>
                }
              />
              <Button type="submit">Kirim</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <CardHeader className="flex w-full items-center justify-between">
        <CardTitle>List Anggaran</CardTitle>
        <div className="flex items-center gap-2">
          <TooltipText
            value="Segarkan data"
            render={
              <Button
                size={"icon"}
                variant={"outline"}
                onClick={() => refetch()}
              >
                <RefreshCw
                  className={cn("size-3.5", isRefetching && "animate-spin")}
                />
              </Button>
            }
          />
          <TooltipText
            value="Tambah Anggaran Baru"
            render={
              <Button
                disabled={isDisabled}
                size={"icon"}
                onClick={() => setDialog("create")}
              >
                {/*{isDisabled ? (
                  <Spinner className="size-3.5" />
                ) : (*/}
                <Plus className="size-3.5" />
                {/*)}*/}
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center flex-col w-full border rounded-lg">
          {isLoading && !data ? (
            Array.from({ length: 4 }, (_, i) => <LoadingData key={i} />)
          ) : data?.data.length === 0 ? (
            <EmptyData type="anggaran" />
          ) : (
            data?.data.map((anggaran, index) => (
              <ItemData
                key={anggaran.id}
                label={anggaran.label}
                handleUp={() => handleReorder(anggaran.id, "up")}
                handleDown={() => handleReorder(anggaran.id, "down")}
                handleDelete={() => handleDelete(anggaran.id, anggaran.label)}
                handleEdit={() => handleEdit(anggaran.id, anggaran.label)}
                isDisabled={isDisabled}
                isDisabledUp={index === 0}
                isDisabledDown={index === data?.data.length - 1}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
