"use client";

import React, { useId, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import z from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import ID from "country-flag-icons/react/1x1/ID";
import GB from "country-flag-icons/react/1x1/GB";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw, Send, X } from "lucide-react";
import { useGetBuyHelpDetail, useUpdateBuyHelp } from "../_api";
import { TooltipText } from "@/providers/tooltip-provider";
import { cn } from "@/lib/utils";

const Editor = dynamic(() => import("@/components/blocks/editor-00/editor"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-148.5" />,
});

const formSchema = z.object({
  judul: z.string().min(3, "Judul ID harus memiliki minimal 3 karakter"),
  judul_en: z.string().min(3, "Judul EN harus memiliki minimal 3 karakter"),
  konten: z.string().min(1, "Konten harus diisi"), // Ubah ke string
  konten_en: z.string().min(1, "Konten harus diisi"), // Ubah ke string
});

export const BuyHelpClient = () => {
  const idFormBuyHelp = useId();
  const [contentState, setContentState] = useState("id");
  const { data: detail, refetch, isRefetching } = useGetBuyHelpDetail();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      judul: detail?.data.judul ?? "",
      judul_en: detail?.data.judul_en ?? "",
      konten: detail?.data.konten ?? "",
      konten_en: detail?.data.konten_en ?? "",
    },
  });

  const { mutate: updateBuyHelp, isPending: isUpdating } = useUpdateBuyHelp();

  const handleClose = () => {
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateBuyHelp({ body: values }, { onSuccess: () => handleClose() });
  };

  const konten = useWatch({ control: form.control, name: "konten" });
  const konten_en = useWatch({ control: form.control, name: "konten_en" });
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Cara Pembelian</h1>
      </div>
      <div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="grid md:grid-cols-6 gap-4">
            <div className="grid md:grid-cols-2 gap-2 col-span-full items-end">
              <Controller
                name="judul"
                control={form.control}
                disabled={isUpdating}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-1"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormBuyHelp}-${field.name}`}
                    >
                      Judul
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={`${idFormBuyHelp}-${field.name}`}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="Judul cara pembelian..."
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
                name="judul_en"
                control={form.control}
                disabled={isUpdating}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-1"
                  >
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={`${idFormBuyHelp}-${field.name}`}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="How to buy title..."
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
            <Tabs
              className={"col-span-full grid grid-cols-1"}
              value={contentState}
              onValueChange={setContentState}
            >
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger
                    value={"id"}
                    className={
                      "data-active:text-yellow-600 dark:data-active:text-yellow-400"
                    }
                  >
                    Konten
                    <div className="rounded overflow-hidden size-4 flex items-center justify-center">
                      <ID />
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value={"en"}
                    className={
                      "data-active:text-yellow-600 dark:data-active:text-yellow-400"
                    }
                  >
                    Konten
                    <div className="rounded overflow-hidden size-4 flex items-center justify-center">
                      <GB />
                    </div>
                  </TabsTrigger>
                </TabsList>
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button size={"sm"}>
                        <Eye />
                        Pratinjau
                      </Button>
                    }
                  />
                  <DialogContent
                    showCloseButton={false}
                    className={
                      "h-[90vh] min-w-[calc(90vh*210/297)] flex flex-col dark:bg-white"
                    }
                  >
                    <DialogHeader>
                      <DialogTitle
                        className={"flex items-center gap-3 dark:text-black"}
                      >
                        Pratinjau Cara Pembelian{" "}
                        {contentState === "id" ? (
                          <div className="rounded overflow-hidden size-5 shadow flex items-center justify-center">
                            <ID />
                          </div>
                        ) : (
                          <div className="rounded overflow-hidden size-5 shadow flex items-center justify-center">
                            <GB />
                          </div>
                        )}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="size-full overflow-auto scrollbar-hide dark:bg-white px-4">
                      <div
                        className="prose prose-sm dark:prose-h2:border-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: contentState === "id" ? konten : konten_en,
                        }}
                      />
                    </div>
                    <DialogFooter className="bg-gray-200">
                      <DialogClose render={<Button>Close</Button>} />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <TabsContent
                className={"col-span-full grid grid-cols-1 w-full"}
                value={"id"}
              >
                <Controller
                  name="konten"
                  control={form.control}
                  disabled={isUpdating}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <div>
                        <Editor
                          placeholder="Konten cara pembelian..."
                          key={"id"}
                          initialHtml={field.value}
                          onHtmlChangeAction={field.onChange}
                        />
                      </div>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </TabsContent>
              <TabsContent
                className={"col-span-full grid grid-cols-1 w-full"}
                value={"en"}
              >
                <Controller
                  name="konten_en"
                  control={form.control}
                  disabled={isUpdating}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <div>
                        <Editor
                          placeholder="How to buy content..."
                          key={"en"}
                          initialHtml={field.value}
                          onHtmlChangeAction={field.onChange}
                        />
                      </div>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </TabsContent>
            </Tabs>
          </FieldGroup>
          <div className="flex justify-end w-full items-center gap-3">
            <TooltipText
              value="Segarkan data"
              render={
                <Button
                  onClick={() => refetch()}
                  size={"icon"}
                  variant={"outline"}
                >
                  <RefreshCw className={cn(isRefetching && "animate-spin")} />
                </Button>
              }
            />
            <Button
              disabled={isUpdating}
              type="button"
              variant={"outline"}
              onClick={handleClose}
            >
              <X className="size-3.5" />
              Reset
            </Button>
            <Button disabled={isUpdating} type="submit">
              {isUpdating ? (
                <Spinner className="size-3.5" />
              ) : (
                <Send className="size-3.5" />
              )}
              {isUpdating ? "Mengirim..." : "Kirim"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
