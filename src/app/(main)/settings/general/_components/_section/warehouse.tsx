"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { extractCoordsFromURL } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").min(3, "Nama minimal 3 karakter"),
  latitude: z.string().min(1, "Latitude wajib diisi"),
  longitude: z.string().min(1, "Longitude wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  phone: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka"),
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
  const [type, setType] = useState<"manual" | "auto">("manual");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: "",
      longitude: "",
      address: "",
      name: "",
      phone: "",
      url: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  const urlField = useWatch({
    control: form.control,
    name: "url",
  });

  useEffect(() => {
    if (!urlField) {
      form.clearErrors("url");
      return;
    }

    const coords = extractCoordsFromURL(urlField);

    if (coords) {
      // Jika valid, isi nilai dan hapus error jika sebelumnya ada
      form.setValue("latitude", coords.lat, {
        shouldValidate: true,
      });
      form.setValue("longitude", coords.lng, {
        shouldValidate: true,
      });
      form.clearErrors("url");
    } else {
      // Jika format URL benar tapi koordinat (@lat,long) tidak ditemukan
      form.setError("url", {
        type: "manual",
        message:
          "URL valid, tapi koordinat tidak ditemukan. Gunakan pin di Gmaps.",
      });
      // Kosongkan lat/long jika URL tidak valid
      form.setValue("latitude", "");
      form.setValue("longitude", "");
    }
  }, [urlField, form]);

  return (
    <div className="grid lg:grid-cols-2 max-w-3xl mx-auto w-full gap-4">
      <h2 className="font-semibold text-lg lg:text-xl tracking-tight">
        Informasi Gudang
      </h2>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
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
                <FieldLabel required htmlFor="name">
                  Nama Gudang
                </FieldLabel>
                <Input
                  {...field}
                  id="name"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Warehouse depok"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-1"
              >
                <FieldLabel required htmlFor="phone">
                  No. Telepon
                </FieldLabel>
                <PhoneInput id={"phone"} placeholder="88888888" {...field} />

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
                className="text-xs h-7 data-active:text-yellow-400!"
              >
                Manual
              </TabsTrigger>
              <TabsTrigger
                value="auto"
                className="text-xs h-7 data-active:text-yellow-400!"
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
                      <FieldLabel required htmlFor="latitude">
                        Latitude
                      </FieldLabel>
                      <Input
                        {...field}
                        id="latitude"
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
                      <FieldLabel required htmlFor="longitude">
                        Longitude
                      </FieldLabel>
                      <Input
                        {...field}
                        id="longitude"
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
                      <FieldLabel required htmlFor="url">
                        Google Maps URL
                      </FieldLabel>
                      <Input
                        {...field}
                        id="url"
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
                        <FieldLabel required htmlFor="latitude">
                          Latitude
                        </FieldLabel>
                        <Input
                          {...field}
                          id="latitude"
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
                        <FieldLabel required htmlFor="longitude">
                          Longitude
                        </FieldLabel>
                        <Input
                          {...field}
                          id="longitude"
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
                <FieldLabel required htmlFor="address">
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
        <div className="flex justify-end items-center w-full">
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </div>
  );
};
