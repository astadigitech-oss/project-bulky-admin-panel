"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { extractCoordsFromURL } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { MouseEvent, useEffect, useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { useGetWarehouse, useUpdateWarehouse } from "../../_api";
import { RotateCw, Send } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").min(3, "Nama minimal 3 karakter"),
  latitude: z.string().min(1, "Latitude wajib diisi"),
  longitude: z.string().min(1, "Longitude wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  kota: z.string().min(1, "Kota wajib diisi"),
  kode_pos: z.string().min(1, "Kode pos wajib diisi"),
  jam_operasional: z.string().min(1, "Jam operasional wajib diisi"),
  url: z
    .url("Format URL tidak valid")
    .refine(
      (val) => val.includes("google.com/maps") || val.includes("goo.gl/maps"),
      "Harus berupa URL Google Maps yang valid",
    )
    .optional()
    .or(z.literal("")),
});

export const WarehouseSettingClient = () => {
  const idWarehouse = `${useId()}-warehouse`;
  const [type, setType] = useState<"manual" | "auto">("manual");

  const { mutate: updateWarehouse, isPending } = useUpdateWarehouse();
  const { data: warehouse } = useGetWarehouse();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      latitude: warehouse?.data.latitude.toString() ?? "",
      longitude: warehouse?.data.longitude.toString() ?? "",
      address: warehouse?.data.alamat ?? "",
      name: warehouse?.data.nama ?? "",
      kota: warehouse?.data.kota ?? "",
      kode_pos: warehouse?.data.kode_pos ?? "",
      jam_operasional: warehouse?.data.jam_operasional ?? "",
      url: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateWarehouse({
      body: {
        latitude: Number.parseFloat(values.latitude),
        longitude: Number.parseFloat(values.longitude),
        alamat: values.address,
        nama: values.name,
        kota: values.kota,
        kode_pos: values.kode_pos,
        jam_operasional: values.jam_operasional,
      },
    });
  };

  const urlField = useWatch({
    control: form.control,
    name: "url",
  });

  const handleReset = (e: MouseEvent) => {
    e.preventDefault();
    form.reset();
  };

  useEffect(() => {
    if (!urlField) {
      form.clearErrors("url");
      return;
    }

    const coords = extractCoordsFromURL(urlField);

    if (coords) {
      form.setValue("latitude", coords.lat, {
        shouldValidate: true,
      });
      form.setValue("longitude", coords.lng, {
        shouldValidate: true,
      });
      form.clearErrors("url");
    } else {
      form.setError("url", {
        type: "manual",
        message:
          "URL valid, tapi koordinat tidak ditemukan. Gunakan pin di Gmaps.",
      });
      form.setValue("latitude", "");
      form.setValue("longitude", "");
    }
  }, [urlField, form]);

  return (
    <div className="grid lg:grid-cols-3 max-w-4xl mx-auto w-full gap-4">
      <div className="p-4">
        <h2 className="font-semibold text-lg lg:text-xl tracking-tight flex items-center relative before:content-[''] before:absolute before:-left-3 before:w-1 before:h-5  before:bg-linear-to-b before:from-yellow-400 before:to-yellow-500 before:rounded-full">
          Informasi Gudang
        </h2>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 border p-2 lg:p-4 rounded-lg dark:bg-gray-900/70 lg:col-span-2"
      >
        <FieldGroup className="grid w-full">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-1"
              >
                <FieldLabel required htmlFor={`${idWarehouse}-${field.name}`}>
                  Nama Gudang
                </FieldLabel>
                <Input
                  {...field}
                  id={`${idWarehouse}-${field.name}`}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Warehouse depok"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="kota"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-1"
                >
                  <FieldLabel required htmlFor={`${idWarehouse}-${field.name}`}>
                    Kota
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${idWarehouse}-${field.name}`}
                    aria-invalid={fieldState.invalid}
                    placeholder="Kota gudang..."
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="kode_pos"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-1"
                >
                  <FieldLabel required htmlFor={`${idWarehouse}-${field.name}`}>
                    Kode Pos
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${idWarehouse}-${field.name}`}
                    aria-invalid={fieldState.invalid}
                    placeholder="Kode pos..."
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name="jam_operasional"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-1"
              >
                <FieldLabel required htmlFor={`${idWarehouse}-${field.name}`}>
                  Jam Operasional
                </FieldLabel>
                <Input
                  {...field}
                  id={`${idWarehouse}-${field.name}`}
                  aria-invalid={fieldState.invalid}
                  placeholder="Jam operasional..."
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Tabs
            value={type}
            onValueChange={(e) => setType(e as "manual" | "auto")}
            className="w-full col-span-1"
          >
            <TabsList>
              <TabsTrigger
                value="manual"
                className="text-xs h-7 data-active:text-yellow-900! dark:data-active:text-yellow-400!"
              >
                Manual
              </TabsTrigger>
              <TabsTrigger
                value="auto"
                className="text-xs h-7 data-active:text-yellow-900! dark:data-active:text-yellow-400!"
              >
                Google Maps URL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="w-full">
              <FieldGroup className="grid grid-cols-2">
                <Controller
                  name="latitude"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-1"
                    >
                      <FieldLabel
                        required
                        htmlFor={`${idWarehouse}-${field.name}`}
                      >
                        Latitude
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${idWarehouse}-${field.name}`}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        placeholder="-6.43654970"
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="longitude"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-1"
                    >
                      <FieldLabel
                        required
                        htmlFor={`${idWarehouse}-${field.name}`}
                      >
                        Longitude
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${idWarehouse}-${field.name}`}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        placeholder="106.84758600"
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </TabsContent>
            <TabsContent value="auto">
              <FieldGroup className="grid">
                <Controller
                  name="url"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="gap-1 col-span-1"
                    >
                      <FieldLabel
                        required
                        htmlFor={`${idWarehouse}-${field.name}`}
                      >
                        Google Maps URL
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${idWarehouse}-${field.name}`}
                        aria-invalid={fieldState.invalid}
                        placeholder="https://www.google.com/maps...."
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <FieldGroup className="grid grid-cols-2">
                  <Controller
                    name="latitude"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1 col-span-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idWarehouse}-${field.name}`}
                        >
                          Latitude
                        </FieldLabel>
                        <Input
                          {...field}
                          id={`${idWarehouse}-${field.name}`}
                          type="number"
                          aria-invalid={fieldState.invalid}
                          placeholder="-6.43654970"
                          readOnly
                          className="read-only:pointer-events-none read-only:cursor-default"
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="longitude"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1 col-span-1"
                      >
                        <FieldLabel
                          required
                          htmlFor={`${idWarehouse}-${field.name}`}
                        >
                          Longitude
                        </FieldLabel>
                        <Input
                          {...field}
                          id={`${idWarehouse}-${field.name}`}
                          type="number"
                          aria-invalid={fieldState.invalid}
                          placeholder="106.84758600"
                          readOnly
                          className="read-only:pointer-events-none read-only:cursor-default"
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldGroup>
            </TabsContent>
          </Tabs>
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-1"
              >
                <FieldLabel required htmlFor={`${idWarehouse}-${field.name}`}>
                  Alamat
                </FieldLabel>
                <Textarea
                  id={"address"}
                  className="min-h-28"
                  placeholder="e.g. jl. monas no. 1 gambir"
                  {...field}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex justify-end items-center w-full gap-3">
          <Button
            type="button"
            disabled={!form.formState.isDirty || isPending}
            onClick={handleReset}
            variant={"secondary"}
          >
            <RotateCw className="size-3.5" />
            Reset
          </Button>
          <Button type="submit" disabled={!form.formState.isDirty || isPending}>
            {isPending ? (
              <Spinner className="size-3.5" />
            ) : (
              <Send className="size-3.5" />
            )}
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
};
