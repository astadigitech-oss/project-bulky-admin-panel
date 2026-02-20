import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Crown,
  Send,
  Trash,
} from "lucide-react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { ProductDetailResponse } from "@/app/(main)/products/list/_api/types";
import { DropzoneList } from "@/components/ui/dropzone-list";
import Image from "next/image";
import { TooltipText } from "@/providers/tooltip-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useDeleteProductImage,
  useReorderProductImage,
  useUploadProductImage,
} from "@/app/(main)/products/list/_api";
import { useConfirm } from "@/hooks/use-confirm";
import { invalidateQuery } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/spinner";

const FILE_RULES = {
  imageMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSize: 10 * 1024 * 1024,
};

const formSchema = z.object({
  gambar: z
    .array(
      z
        .file()
        .max(FILE_RULES.maxSize, "Ukuran maksimal 10MB")
        .mime(FILE_RULES.imageMimeTypes),
    )
    .min(1, "Gambar wajib diunggah")
    .max(10, "Hanya boleh 10 file"),
});

export const ImageSection = ({
  detail,
  setState,
}: {
  detail?: ProductDetailResponse["data"];
  setState: (value: string) => Promise<URLSearchParams>;
}) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      gambar: [],
    },
  });

  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus Gambar",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );
  const [DialogReorder, confirmReorder] = useConfirm(
    "[command]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );
  const { mutate: uploadImage, isPending: isUploading } =
    useUploadProductImage();
  const { mutate: reorderImage, isPending: isReordering } =
    useReorderProductImage();
  const { mutate: deleteImage, isPending: isDeleting } =
    useDeleteProductImage();

  const isDisabled = isUploading || isReordering || isDeleting;

  const handleUpload = (values: z.infer<typeof formSchema>) => {
    const body = new FormData();
    for (const g of values.gambar) {
      body.append("gamabr", g);
    }
    uploadImage(
      { body, params: { id: detail?.id } },
      {
        onSuccess: async () => {
          await invalidateQuery(queryClient, [
            ["product-detail", detail?.id ?? ""],
          ]);
        },
      },
    );
  };
  const handleReorder = async (imageId: string, direction: "up" | "down") => {
    const ok = await confirmReorder(
      direction === "up" ? "Naikkan Urutan" : "Turunkan Urutan",
      "command",
      "default",
    );
    if (!ok) return;
    reorderImage(
      { body: { direction }, params: { id: detail?.id, imageId } },
      {
        onSuccess: async () => {
          await invalidateQuery(queryClient, [
            ["product-detail", detail?.id ?? ""],
          ]);
        },
      },
    );
  };
  const handleDelete = async (imageId: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteImage(
      { params: { id: detail?.id, imageId } },
      {
        onSuccess: async () => {
          await invalidateQuery(queryClient, [
            ["product-detail", detail?.id ?? ""],
          ]);
        },
      },
    );
  };
  return (
    <FieldGroup className="grid gap-6 w-full max-w-5xl mx-auto">
      <DialogDelete />
      <DialogReorder />
      <div className="mr-auto flex items-center">
        <Button
          variant={"ghost"}
          className={"hover:mr-2 transition-all peer"}
          onClick={() => setState("")}
          size={"icon"}
        >
          <ArrowLeft />
        </Button>
        <p className="text-sm font-semibold peer-hover:underline underline-offset-2">
          Edit Gambar
        </p>
      </div>
      {detail ? (
        <div className="flex flex-col gap-6 w-full">
          {detail?.gambar.length < 10 && (
            <form
              onSubmit={form.handleSubmit(handleUpload)}
              className="flex flex-col gap-4"
            >
              <Controller
                control={form.control}
                name="gambar"
                render={({ field, fieldState }) => (
                  <Field className="gap-1">
                    <FieldLabel>Upload Gambar</FieldLabel>
                    <DropzoneList
                      onChange={field.onChange}
                      value={field.value}
                      error={fieldState.invalid}
                      accept={Object.fromEntries(
                        FILE_RULES.imageMimeTypes.map((m) => [m, []]),
                      )}
                      maxSize={FILE_RULES.maxSize}
                      maxFiles={10 - (detail?.gambar.length ?? 0)}
                      isEdit
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="h-16 flex items-center w-full rounded-xl bg-gray-200 dark:bg-gray-800 px-6 justify-end">
                <Button type="submit" disabled={isDisabled}>
                  {isUploading ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          )}
          <div className="flex gap-1 flex-col">
            <p className="text-xs font-medium">List Gambar</p>
            <div className="grid grid-cols-5 p-2 xl:p-3 border border-gray-300 dark:border-gray-700 rounded-xl gap-1.5 xl:gap-3">
              {detail?.gambar.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-gray-100 dark:bg-gray-800 size-full rounded-lg p-2 flex flex-col gap-1 xl:gap-2 relative"
                >
                  <div className="w-full aspect-square rounded-md relative overflow-hidden shadow">
                    <Image
                      src={item.gambar_url}
                      alt={item.id}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="size-7 flex items-center justify-center">
                      <TooltipText
                        value={
                          idx === 0 ? "Gambar Utama" : "Bukan Gambar Utama"
                        }
                        render={
                          <Crown
                            className={cn(
                              "size-3.5 fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600",
                              idx === 0 &&
                                "fill-yellow-500 text-yellow-500 dark:fill-yellow-300 dark:text-yellow-300",
                            )}
                          />
                        }
                      />
                    </div>
                    <div className="flex items-center">
                      <TooltipText
                        value="Naikan Urutan"
                        render={
                          <Button
                            size={"icon-sm"}
                            variant={"ghost"}
                            className={
                              "hover:bg-gray-200 dark:hover:bg-gray-700"
                            }
                            disabled={idx === 0 || isDisabled}
                            onClick={() => handleReorder(item.id, "up")}
                          >
                            {isDisabled ? (
                              <Spinner className="size-3.5" />
                            ) : (
                              <ArrowUp className="size-3.5" />
                            )}
                          </Button>
                        }
                      />
                      <TooltipText
                        value="Naikan Urutan"
                        render={
                          <Button
                            size={"icon-sm"}
                            variant={"ghost"}
                            className={
                              "hover:bg-gray-200 dark:hover:bg-gray-700"
                            }
                            disabled={
                              idx === detail.gambar.length - 1 || isDisabled
                            }
                            onClick={() => handleReorder(item.id, "down")}
                            type="button"
                          >
                            {isDisabled ? (
                              <Spinner className="size-3.5" />
                            ) : (
                              <ArrowDown className="size-3.5" />
                            )}
                          </Button>
                        }
                      />
                      <TooltipText
                        value="Hapus Gambar"
                        render={
                          <Button
                            size={"icon-sm"}
                            variant={"ghost"}
                            className={
                              "hover:bg-red-200 dark:hover:bg-red-500/30"
                            }
                            onClick={() => handleDelete(item.id)}
                            disabled={isDisabled}
                            type="button"
                          >
                            {isDisabled ? (
                              <Spinner className="size-3.5 text-red-500 dark:text-red-500" />
                            ) : (
                              <Trash className="size-3.5 text-red-500 dark:text-red-500" />
                            )}
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium">Upload Gambar</p>
            <Skeleton className="w-full aspect-[3.3/1]" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium">List Gambar</p>
            <div className="grid grid-cols-5 p-2 xl:p-3 border border-mutted rounded-xl gap-1.5 xl:gap-3">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Skeleton key={idx} className="w-full aspect-5/6" />
              ))}
            </div>
          </div>
        </div>
      )}
    </FieldGroup>
  );
};
