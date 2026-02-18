"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Eye, Scale, Send, X } from "lucide-react";
import { useId, useState } from "react";
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
  useCreateDisclaimer,
  useGetDisclaimerDetail,
  useUpdateDisclaimer,
} from "../../_api";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";
import Link from "next/link";
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

const Editor = dynamic(() => import("@/components/blocks/editor-00/editor"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-148.5" />,
});

const formSchema = z.object({
  judul: z.string().min(3, "Judul ID harus memiliki minimal 3 karakter"),
  judul_en: z.string().min(3, "Judul EN harus memiliki minimal 3 karakter"),
  konten: z.string().min(1, "Konten harus diisi"),
  konten_en: z.string().min(1, "Konten harus diisi"),
  is_active: z.boolean(),
});

export const DisclaimerDetailClient = () => {
  const disclaimerId = useParams().disclaimerId;
  const idFormDisclaimer = useId();
  const isCreate = disclaimerId === "create";
  const [contentState, setContentState] = useState("id");
  const { data: detail } = useGetDisclaimerDetail({
    id: isCreate ? undefined : (disclaimerId as string),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      judul: detail?.data.judul.id ?? "",
      judul_en: detail?.data.judul.en ?? "",
      konten: detail?.data.konten.id ?? "",
      konten_en: detail?.data.konten.en ?? "",
      is_active: detail?.data.is_active ?? false,
    },
  });

  const { mutate: createDisclaimer, isPending: isCreating } =
    useCreateDisclaimer();
  const { mutate: updateDisclaimer, isPending: isUpdating } =
    useUpdateDisclaimer();

  const isLoading = isCreating || isUpdating;

  const handleClose = () => {
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    switch (isCreate) {
      case true:
        const finalBody = {
          judul: values.judul,
          judul_en: values.judul_en,
          konten: values.konten,
          konten_en: values.konten_en,
        };
        createDisclaimer(
          { body: finalBody },
          { onSuccess: () => handleClose() },
        );
        break;
      case false:
        updateDisclaimer(
          { body: values, params: { id: detail?.data.id ?? "" } },
          { onSuccess: () => handleClose() },
        );
        break;
    }
  };

  const konten = useWatch({ control: form.control, name: "konten" });
  const konten_en = useWatch({ control: form.control, name: "konten_en" });

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center gap-2">
        <Link href={"/policies/disclaimer"}>
          <Button variant={"ghost"} size={"icon-lg"}>
            <Scale className="size-5" />
          </Button>
        </Link>
        <ChevronRight className="size-4" />
        <h1 className="leading-none font-semibold text-2xl">
          {isCreate ? "Tambah" : "Edit"} Penaifan{" "}
          <span className="text-xl">(Disclaimer)</span>
        </h1>
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
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="gap-1 col-span-1"
                  >
                    <FieldLabel
                      required
                      htmlFor={`${idFormDisclaimer}-${field.name}`}
                    >
                      Judul
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={`${idFormDisclaimer}-${field.name}`}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="Judul penaifan..."
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
                disabled={isLoading}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-1"
                  >
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={`${idFormDisclaimer}-${field.name}`}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="Disclaimer title..."
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
                        Pratinjau Penaifan (disclaimer){" "}
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
                  disabled={isLoading}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <div>
                        <Editor
                          placeholder="Konten penaifan..."
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
                  disabled={isLoading}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-full"
                    >
                      <div>
                        <Editor
                          placeholder="Disclaimer content..."
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
            <Button
              disabled={isLoading}
              type="button"
              variant={"outline"}
              onClick={handleClose}
            >
              <X className="size-3.5" />
              Reset
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
    </div>
  );
};
