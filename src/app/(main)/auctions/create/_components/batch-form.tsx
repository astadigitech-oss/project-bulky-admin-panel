"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DropzoneList } from "@/components/ui/dropzone-list";
import { DropzonePDF } from "@/components/ui/dropzone-pdf";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, ChevronRight, Gavel, MapPin, Plus, Save, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { cn, extractCoordsFromURL, formatRupiah } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lottie } from "lottie-react";
import {
  useCreateAuction,
  useGetAuctionDetail,
  useGetAuctionProductOptions,
  useGetKategoriSelect,
  useGetKondisiPaketSelect,
  useGetKondisiSelect,
  useGetMerekSelect,
  useGetSumberSelect,
  useGetWarehouseSelect,
  usePublishAuction,
  useUpdateAuction,
  useUploadAuctionAsset,
} from "../../_api";
import {
  AuctionBatchDetail,
  AuctionDraftInput,
  AuctionItemSourceType,
  AuctionProductOption,
} from "../../_api/types";

const formSchema = z.object({
  nama_id: z.string().min(1, "Nama ID wajib diisi"),
  nama_en: z.string().optional(),
  description: z.string().optional(),
  origin_type: z.enum(["BULKY_WAREHOUSE", "SUPPLIER"]),
  warehouse_id: z.string().optional(),
  supplier_name: z.string().optional(),
  supplier_address: z.string().optional(),
  supplier_provinsi: z.string().optional(),
  supplier_kota: z.string().optional(),
  supplier_kecamatan: z.string().optional(),
  supplier_kelurahan: z.string().optional(),
  supplier_kode_pos: z.string().optional(),
  supplier_latitude: z.string().optional(),
  supplier_longitude: z.string().optional(),
  kategori_id: z.string().optional(),
  kondisi_id: z.string().optional(),
  kondisi_paket_id: z.string().optional(),
  sumber_id: z.string().optional(),
  discrepancy_percentage: z.string().optional(),
  merek_ids: z.array(z.string()),
  panjang_cm: z.string().optional(),
  lebar_cm: z.string().optional(),
  tinggi_cm: z.string().optional(),
  berat_kg: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type BatchItem = {
  source_type: AuctionItemSourceType;
  produk_id?: string;
  nama_snapshot: string;
  quantity: number;
  unit_price: string;
  stock_available: number;
};

type UploadedAsset = {
  id: string;
  url?: string;
  kind: "IMAGE" | "PDF";
  original_name?: string;
};

type SaveStage = "uploading" | "saving" | null;

const SaveProgressDialog = ({
  stage,
  isEdit,
}: {
  stage: SaveStage;
  isEdit: boolean;
}) => {
  const uploading = stage === "uploading";

  return (
    <Dialog open={stage !== null}>
      <DialogContent
        className="w-[min(36rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <div className="grid items-center gap-5 px-6 py-6 sm:grid-cols-[172px_minmax(0,1fr)]">
          <Lottie
            src="/assets/lottie/pc-to-cloud-server.json"
            loop
            autoplay
            className="mx-auto h-32 w-40 sm:mx-0"
            aria-label="Animasi proses penyimpanan batch"
          />
          <DialogHeader className="items-start gap-2 text-left">
            <DialogTitle>
              {uploading
                ? "Mengunggah aset batch"
                : isEdit
                  ? "Memperbarui batch"
                  : "Menyimpan batch baru"}
            </DialogTitle>
            <DialogDescription className="max-w-sm text-left leading-relaxed">
              {uploading
                ? "Gambar sedang dikompresi ke WebP dan diunggah ke storage. Jangan tutup halaman ini."
                : isEdit
                  ? "Perubahan batch sedang disimpan ke database. Jangan tutup halaman ini."
                  : "Batch sedang disimpan ke database. Jangan tutup halaman ini."}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="border-t bg-muted/30 px-6 py-3 text-center text-xs text-muted-foreground sm:text-right" aria-live="polite">
          {uploading ? "Menunggu aset dikonfirmasi server…" : "Menunggu penyimpanan dikonfirmasi server…"}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getSelectLabel = (item: any) => {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const o = item as {
      nama?: unknown;
      nama_id?: unknown;
      nama_en?: unknown;
      id?: unknown;
    };
    if (typeof o.nama === "string" && o.nama.trim()) return o.nama;
    if (typeof o.nama_id === "string" && o.nama_id.trim()) return o.nama_id;
    if (typeof o.nama_en === "string" && o.nama_en.trim()) return o.nama_en;
  }
  return "";
};

export const BatchForm = ({ batchId }: { batchId?: string }) => {
  const router = useRouter();
  const isEdit = !!batchId;

  const { data: detail } = useGetAuctionDetail(batchId ?? "");
  const batch = detail?.data;

  const { data: warehouseData } = useGetWarehouseSelect();
  const { data: kategoriData } = useGetKategoriSelect();
  const { data: kondisiData } = useGetKondisiSelect();
  const { data: kondisiPaketData } = useGetKondisiPaketSelect();
  const { data: sumberData } = useGetSumberSelect();
  const { data: merekData } = useGetMerekSelect();

  const warehouseOptions = warehouseData?.data ?? [];
  const kategoriOptions = kategoriData?.data ?? [];
  const kondisiOptions = kondisiData?.data ?? [];
  const kondisiPaketOptions = kondisiPaketData?.data ?? [];
  const sumberOptions = sumberData?.data ?? [];
  const merekOptions = merekData?.data ?? [];

  const [items, setItems] = useState<BatchItem[]>([]);
  const [images, setImages] = useState<UploadedAsset[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pdf, setPdf] = useState<UploadedAsset | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [gmapsUrl, setGmapsUrl] = useState("");

  const handleGmapsUrlChange = (url: string) => {
    setGmapsUrl(url);
    if (!url.trim()) return;
    const coords = extractCoordsFromURL(url);
    if (coords) {
      form.setValue("supplier_latitude", coords.lat, { shouldValidate: true });
      form.setValue("supplier_longitude", coords.lng, { shouldValidate: true });
      toast.success("Koordinat latitude & longitude berhasil diambil dari link Google Maps!");
    } else {
      toast.error("Format URL Google Maps tidak memuat pola koordinat @latitude,longitude.");
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_id: "",
      nama_en: "",
      description: "",
      origin_type: "BULKY_WAREHOUSE",
      warehouse_id: "",
      supplier_name: "",
      supplier_address: "",
      supplier_provinsi: "",
      supplier_kota: "",
      supplier_kecamatan: "",
      supplier_kelurahan: "",
      supplier_kode_pos: "",
      supplier_latitude: "",
      supplier_longitude: "",
      kategori_id: "",
      kondisi_id: "",
      kondisi_paket_id: "",
      sumber_id: "",
      discrepancy_percentage: "0",
      merek_ids: [],
      panjang_cm: "",
      lebar_cm: "",
      tinggi_cm: "",
      berat_kg: "",
    },
  });

  // Sinkronkan form & state saat batch detail dimuat (mode edit).
  useEffect(() => {
    if (!batch) return;
    form.reset({
      nama_id: batch.nama_id,
      nama_en: batch.nama_en ?? "",
      description: batch.description ?? "",
      origin_type: batch.origin_type ?? "BULKY_WAREHOUSE",
      warehouse_id: batch.warehouse_id ?? "",
      supplier_name: batch.supplier_name ?? "",
      supplier_address: batch.supplier_address ?? "",
      supplier_provinsi: batch.supplier_provinsi ?? "",
      supplier_kota: batch.supplier_kota ?? "",
      supplier_kecamatan: batch.supplier_kecamatan ?? "",
      supplier_kelurahan: batch.supplier_kelurahan ?? "",
      supplier_kode_pos: batch.supplier_kode_pos ?? "",
      supplier_latitude: batch.supplier_latitude ?? "",
      supplier_longitude: batch.supplier_longitude ?? "",
      kategori_id: batch.kategori_id ?? "",
      kondisi_id: batch.kondisi_id ?? "",
      kondisi_paket_id: batch.kondisi_paket_id ?? "",
      sumber_id: batch.sumber_id ?? "",
      discrepancy_percentage: batch.discrepancy_percentage ?? "0",
      merek_ids: batch.merek_ids ?? [],
      panjang_cm: batch.panjang_cm ?? "",
      lebar_cm: batch.lebar_cm ?? "",
      tinggi_cm: batch.tinggi_cm ?? "",
      berat_kg: batch.berat_kg ?? "",
    });
    setItems(
      (batch.items ?? []).map((i) => ({
        source_type: i.source_type,
        produk_id: i.produk_id ?? undefined,
        nama_snapshot: i.nama_snapshot,
        quantity: i.quantity,
        unit_price: i.unit_price_snapshot,
        stock_available: 0,
      })),
    );
    setImages(
      (batch.images ?? []).map((i) => ({
        id: i.id,
        url: i.url,
        kind: "IMAGE" as const,
        original_name: i.original_name,
      })),
    );
    setPdf(
      batch.pdf
        ? {
            id: batch.pdf.id,
            url: batch.pdf.url,
            kind: "PDF" as const,
            original_name: batch.pdf.original_name,
          }
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch]);

  const [panjangCm, lebarCm, tinggiCm, beratKg, discrepancy, originType] = useWatch({
    control: form.control,
    name: [
      "panjang_cm",
      "lebar_cm",
      "tinggi_cm",
      "berat_kg",
      "discrepancy_percentage",
      "origin_type",
    ],
  });

  const grandTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + (Number(item.unit_price) || 0) * item.quantity;
    }, 0);
  }, [items]);

  const totalQuantity = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const volumeM3 = useMemo(() => {
    const p = Number(panjangCm) || 0;
    const l = Number(lebarCm) || 0;
    const t = Number(tinggiCm) || 0;
    return (p * l * t) / 1000000;
  }, [panjangCm, lebarCm, tinggiCm]);

  const minBidAmount = useMemo(
    () => Math.ceil(grandTotal * 0.001),
    [grandTotal],
  );

  const { mutate: createAuction, isPending: isCreating } = useCreateAuction();
  const { mutate: updateAuction, isPending: isUpdating } = useUpdateAuction();
  const { mutate: publishAuction, isPending: isPublishing } = usePublishAuction();
  const { mutate: uploadAsset, isPending: isUploading } = useUploadAuctionAsset();

  const isSaving = isCreating || isUpdating;
  const isDisabled = isSaving || isPublishing || isUploading || uploading;
  const saveStage: SaveStage = uploading || isUploading ? "uploading" : isSaving ? "saving" : null;

  const handleImageChange = async (files: File[]) => {
    setImageFiles(files);
    if (files.length === 0) return;
    setUploading(true);
    const newAssets: UploadedAsset[] = [];
    try {
      for (const file of files) {
        const res = await new Promise<{ id: string; url: string }>(
          (resolve, reject) => {
            uploadAsset(
              { file, kind: "IMAGE" },
              {
                onSuccess: (data) =>
                  resolve({ id: data.data.data.id, url: data.data.data.url }),
                onError: (err) => reject(err),
              },
            );
          },
        );
        newAssets.push({ id: res.id, url: res.url, kind: "IMAGE" });
      }
      // Maksimal 10 gambar.
      setImages((prev) => [...prev, ...newAssets].slice(0, 10));
    } catch {
      toast.error("Gagal mengupload gambar");
    } finally {
      setImageFiles([]);
      setUploading(false);
    }
  };

  const handlePdfChange = async (files: File[]) => {
    setPdfFiles(files);
    if (files.length === 0) {
      setPdf(null);
      return;
    }
    setUploading(true);
    try {
      const res = await new Promise<{ id: string; url: string }>(
        (resolve, reject) => {
          uploadAsset(
            { file: files[0], kind: "PDF" },
            {
              onSuccess: (data) =>
                resolve({ id: data.data.data.id, url: data.data.data.url }),
              onError: (err) => reject(err),
            },
          );
        },
      );
      setPdf({ id: res.id, url: res.url, kind: "PDF" });
    } catch {
      toast.error("Gagal mengupload PDF");
    } finally {
      setPdfFiles([]);
      setUploading(false);
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    setImages((previous) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSubmit = async (values: FormValues) => {
    const isSupplier = values.origin_type === "SUPPLIER";
    const body: AuctionDraftInput = {
      nama_id: values.nama_id,
      nama_en: values.nama_en || null,
      description: values.description || null,
      origin_type: values.origin_type,
      warehouse_id: !isSupplier ? values.warehouse_id || null : null,
      supplier_name: isSupplier ? values.supplier_name || null : null,
      supplier_address: isSupplier ? values.supplier_address || null : null,
      supplier_provinsi: isSupplier ? values.supplier_provinsi || null : null,
      supplier_kota: isSupplier ? values.supplier_kota || null : null,
      supplier_kecamatan: isSupplier ? values.supplier_kecamatan || null : null,
      supplier_kelurahan: isSupplier ? values.supplier_kelurahan || null : null,
      supplier_kode_pos: isSupplier ? values.supplier_kode_pos || null : null,
      supplier_latitude: isSupplier ? values.supplier_latitude || null : null,
      supplier_longitude: isSupplier ? values.supplier_longitude || null : null,
      kategori_id: values.kategori_id || null,
      kondisi_id: values.kondisi_id || null,
      kondisi_paket_id: values.kondisi_paket_id || null,
      sumber_id: values.sumber_id || null,
      discrepancy_percentage: values.discrepancy_percentage || "0",
      merek_ids: values.merek_ids,
      items: items.map((i) =>
        i.source_type === "CATALOG"
          ? { source_type: "CATALOG" as const, produk_id: i.produk_id, quantity: i.quantity }
          : { source_type: "MANUAL" as const, nama: i.nama_snapshot, unit_price: i.unit_price, quantity: i.quantity },
      ),
      panjang_cm: values.panjang_cm || "0",
      lebar_cm: values.lebar_cm || "0",
      tinggi_cm: values.tinggi_cm || "0",
      berat_kg: values.berat_kg || "0",
      image_asset_ids: images.map((i) => i.id),
      pdf_asset_id: pdf?.id ?? null,
    };

    const idempotencyKey = `create-batch-${Date.now()}`;

    if (isEdit) {
      updateAuction(
        { body: { ...body, version: batch?.version ?? 1 }, params: { id: batchId! } },
        {
          onSuccess: (data) => {
            toast.success(data.data.message);
            router.push(`/auctions/${batchId}`);
          },
        },
      );
    } else {
      createAuction(
        { body, idempotencyKey },
        {
          onSuccess: (data) => {
            toast.success(data.data.message);
            router.push(`/auctions/${data.data.data.id}`);
          },
        },
      );
    }
  };

  const handlePublish = async () => {
    if (!batchId || !batch) return;
    publishAuction(
      { body: { version: batch.version }, params: { id: batchId }, idempotencyKey: `publish-${batchId}` },
      {
        onSuccess: (data) => {
          toast.success(data.data.message);
          router.push(`/auctions/${batchId}`);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-20">
      <SaveProgressDialog stage={saveStage} isEdit={isEdit} />
      <div className="flex items-center gap-2">
        <Link href={batchId ? `/auctions/${batchId}` : "/auctions/list"}>
          <Button variant="ghost" size="icon-lg">
            <Gavel className="size-5" />
          </Button>
        </Link>
        <ChevronRight className="size-4" />
        <h1 className="leading-none font-semibold text-2xl">
          {isEdit ? "Edit Batch" : "Buat Batch"}
        </h1>
      </div>
      <Separator />
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup className="grid gap-6 w-full max-w-5xl mx-auto">
          {images.length < 10 && (
            <Field className="gap-1">
              <FieldLabel>Gambar Batch ({images.length}/10)</FieldLabel>
              <DropzoneList
                onChange={handleImageChange}
                value={imageFiles}
                maxFiles={10 - images.length}
                maxSize={5 * 1024 * 1024}
                accept={{ "image/jpeg": [], "image/png": [], "image/webp": [] }}
                isEdit={isEdit}
              />
            </Field>
          )}

          {images.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium">Daftar Gambar Batch</p>
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-300 p-3 sm:grid-cols-4 xl:grid-cols-5 dark:border-gray-700">
                {images.map((image, index) => (
                  <div key={image.id} className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                    <div className="relative aspect-square overflow-hidden rounded-md shadow">
                      {image.url && <Image src={image.url} alt={image.original_name ?? `Gambar batch ${index + 1}`} fill sizes="(max-width: 640px) 45vw, (max-width: 1280px) 22vw, 180px" className="object-cover" />}
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-1">
                      <Button type="button" size="icon-sm" variant="ghost" disabled={index === 0} onClick={() => moveImage(index, "up")}><ArrowUp className="size-3.5" /></Button>
                      <Button type="button" size="icon-sm" variant="ghost" disabled={index === images.length - 1} onClick={() => moveImage(index, "down")}><ArrowDown className="size-3.5" /></Button>
                      <Button type="button" size="icon-sm" variant="ghost" className="hover:bg-red-200 dark:hover:bg-red-500/30" onClick={() => setImages((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="size-3.5 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mx-auto grid w-full gap-6">
            <Field className="gap-1">
              <FieldLabel>Dokumen PDF (Opsional)</FieldLabel>
              <DropzonePDF
                onChange={handlePdfChange}
                value={pdfFiles}
                oldValue={pdf?.url}
                onRemoveOld={() => setPdf(null)}
              />
            </Field>

            <div className="grid gap-4 lg:grid-cols-2">
              <Controller
                name="nama_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel required>Nama ID</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="Nama batch (ID)..."
                        autoComplete="off"
                      />
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
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Nama EN</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        placeholder="Nama batch (EN)..."
                        autoComplete="off"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
            </div>
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <Field className="gap-1">
                  <FieldLabel>Deskripsi</FieldLabel>
                  <Textarea
                    {...field}
                    className="min-h-[90px]"
                    placeholder="Deskripsi batch..."
                  />
                </Field>
              )}
            />

            <Controller
              name="origin_type"
              control={form.control}
              render={({ field }) => (
                <Field className="gap-2">
                  <FieldLabel>Asal Pengiriman</FieldLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button type="button" variant={field.value === "BULKY_WAREHOUSE" ? "default" : "outline"} onClick={() => field.onChange("BULKY_WAREHOUSE")}>
                      Gudang Bulky
                    </Button>
                    <Button type="button" variant={field.value === "SUPPLIER" ? "default" : "outline"} onClick={() => field.onChange("SUPPLIER")}>
                      Gudang Supplier
                    </Button>
                  </div>
                </Field>
              )}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              {originType === "BULKY_WAREHOUSE" && <Controller
                name="warehouse_id"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Warehouse</FieldLabel>
                    <Combobox
                      items={warehouseOptions}
                      value={field.value}
                      onValueChange={(e) => field.onChange(getSelectId(e))}
                      itemToStringLabel={(v: any) => getSelectLabel(v)}
                    >
                      <ComboboxInput placeholder="Pilih warehouse..." />
                      <ComboboxContent>
                        <ComboboxEmpty>Kosong</ComboboxEmpty>
                        <ComboboxList>
                          {(item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {getSelectLabel(item)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />}
              <Controller
                name="kategori_id"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Kategori</FieldLabel>
                    <Combobox
                      items={kategoriOptions}
                      value={field.value}
                      onValueChange={(e) => field.onChange(getSelectId(e))}
                      itemToStringLabel={(v: any) => getSelectLabel(v)}
                    >
                      <ComboboxInput placeholder="Pilih kategori..." />
                      <ComboboxContent>
                        <ComboboxEmpty>Kosong</ComboboxEmpty>
                        <ComboboxList>
                          {(item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {getSelectLabel(item)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />
              <Controller
                name="kondisi_id"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Kondisi Produk</FieldLabel>
                    <Combobox
                      items={kondisiOptions}
                      value={field.value}
                      onValueChange={(e) => field.onChange(getSelectId(e))}
                      itemToStringLabel={(v: any) => getSelectLabel(v)}
                    >
                      <ComboboxInput placeholder="Pilih kondisi..." />
                      <ComboboxContent>
                        <ComboboxEmpty>Kosong</ComboboxEmpty>
                        <ComboboxList>
                          {(item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {getSelectLabel(item)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />
              <Controller
                name="kondisi_paket_id"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Kondisi Paket</FieldLabel>
                    <Combobox
                      items={kondisiPaketOptions}
                      value={field.value}
                      onValueChange={(e) => field.onChange(getSelectId(e))}
                      itemToStringLabel={(v: any) => getSelectLabel(v)}
                    >
                      <ComboboxInput placeholder="Pilih kondisi paket..." />
                      <ComboboxContent>
                        <ComboboxEmpty>Kosong</ComboboxEmpty>
                        <ComboboxList>
                          {(item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {getSelectLabel(item)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />
              <Controller
                name="sumber_id"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Sumber</FieldLabel>
                    <Combobox
                      items={sumberOptions}
                      value={field.value}
                      onValueChange={(e) => field.onChange(getSelectId(e))}
                      itemToStringLabel={(v: any) => getSelectLabel(v)}
                    >
                      <ComboboxInput placeholder="Pilih sumber..." />
                      <ComboboxContent>
                        <ComboboxEmpty>Kosong</ComboboxEmpty>
                        <ComboboxList>
                          {(item: any) => (
                            <ComboboxItem key={item.id} value={item.id}>
                              {getSelectLabel(item)}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                )}
              />
              <Controller
                name="discrepancy_percentage"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Discrepancy (%)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        autoComplete="off"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
            </div>

            {originType === "SUPPLIER" && (
              <div className="grid gap-4 rounded-lg border p-4 bg-muted/20">
                <div className="flex flex-col gap-1 lg:col-span-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <h3 className="font-semibold text-sm">Alamat & Titik Pengiriman Gudang Supplier</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Diperlukan untuk estimasi ongkir Deliveree (koordinat pin map) dan Forwarder (hierarki wilayah) di Storefront.
                  </p>
                </div>

                <Controller
                  name="supplier_name"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="gap-1 lg:col-span-2">
                      <FieldLabel required>Nama Supplier / Gudang</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...field} placeholder="Contoh: PT Sumber Rezeki / Gudang Supplier Cakung" />
                      </InputGroup>
                    </Field>
                  )}
                />

                <Controller
                  name="supplier_address"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="gap-1 lg:col-span-2">
                      <FieldLabel required>Alamat Tampilan Lengkap</FieldLabel>
                      <Textarea
                        {...field}
                        placeholder="Alamat lengkap (jalan, nomor, patokan) untuk tampilan dan penjemputan paket..."
                        className="min-h-[70px]"
                      />
                    </Field>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:col-span-2">
                  <Controller
                    name="supplier_provinsi"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel required>Provinsi</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} placeholder="Contoh: Jawa Barat" />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <Controller
                    name="supplier_kota"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel required>Kota / Kabupaten</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} placeholder="Contoh: Bogor" />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <Controller
                    name="supplier_kecamatan"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel required>Kecamatan</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} placeholder="Contoh: Cibinong" />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <Controller
                    name="supplier_kelurahan"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Kelurahan (Opsional)</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} placeholder="Contoh: Pakansari" />
                        </InputGroup>
                      </Field>
                    )}
                  />
                  <Controller
                    name="supplier_kode_pos"
                    control={form.control}
                    render={({ field }) => (
                      <Field className="gap-1">
                        <FieldLabel>Kode Pos (Opsional)</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} placeholder="Contoh: 16915" />
                        </InputGroup>
                      </Field>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-3 rounded-md border bg-background p-3 lg:col-span-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold">Titik Koordinat GPS (Deliveree)</span>
                    <span className="text-[11px] text-muted-foreground">
                      Masukkan koordinat desimal atau tempel tautan Google Maps untuk ekstraksi otomatis.
                    </span>
                  </div>

                  <Field className="gap-1">
                    <FieldLabel className="text-xs">Tempel Link Google Maps (Auto-fill)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        value={gmapsUrl}
                        onChange={(e) => handleGmapsUrlChange(e.target.value)}
                        placeholder="https://maps.google.com/?q=@-6.4697743,106.859898..."
                      />
                    </InputGroup>
                  </Field>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Controller
                      name="supplier_latitude"
                      control={form.control}
                      render={({ field }) => (
                        <Field className="gap-1">
                          <FieldLabel required>Latitude</FieldLabel>
                          <InputGroup>
                            <InputGroupInput {...field} type="text" inputMode="decimal" placeholder="-6.4697743" />
                          </InputGroup>
                        </Field>
                      )}
                    />
                    <Controller
                      name="supplier_longitude"
                      control={form.control}
                      render={({ field }) => (
                        <Field className="gap-1">
                          <FieldLabel required>Longitude</FieldLabel>
                          <InputGroup>
                            <InputGroupInput {...field} type="text" inputMode="decimal" placeholder="106.859898" />
                          </InputGroup>
                        </Field>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-4">
              <Controller
                name="panjang_cm"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Panjang (cm)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name="lebar_cm"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Lebar (cm)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name="tinggi_cm"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Tinggi (cm)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name="berat_kg"
                control={form.control}
                render={({ field }) => (
                  <Field className="gap-1">
                    <FieldLabel>Berat (kg)</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                      />
                    </InputGroup>
                  </Field>
                )}
              />
            </div>
          </div>

          <ItemPicker items={items} setItems={setItems} allowCatalog={originType === "BULKY_WAREHOUSE"} />

          <SummaryCards
            grandTotal={grandTotal}
            totalQuantity={totalQuantity}
            volumeM3={volumeM3}
            minBidAmount={minBidAmount}
          />

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            {isEdit && batch?.status === "DRAFT" && (
              <Button
                type="button"
                variant="outline"
                disabled={isDisabled}
                onClick={handlePublish}
              >
                {isPublishing ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Send className="size-3.5" />
                )}
                Buka Lelang
              </Button>
            )}
            <Button type="submit" disabled={isDisabled}>
              {isSaving ? (
                <Spinner className="size-3.5" />
              ) : (
                <Save className="size-3.5" />
              )}
              Simpan Draft
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};

const getSelectId = (value: any) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.id === "string")
    return value.id;
  return "";
};

const ItemPicker = ({
  items,
  setItems,
  allowCatalog,
}: {
  items: BatchItem[];
  setItems: React.Dispatch<React.SetStateAction<BatchItem[]>>;
  allowCatalog: boolean;
}) => {
  const [search, setSearch] = useState("");
  const { data: productData, isPending } = useGetAuctionProductOptions({
    page: 1,
    per_page: 20,
    search,
  });
  const options = productData?.data ?? [];

  const handleAdd = (product: AuctionProductOption) => {
    setItems((prev) => {
      if (prev.some((i) => i.produk_id === product.id)) {
        return prev.map((i) =>
          i.produk_id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [
        ...prev,
        {
          source_type: "CATALOG",
          produk_id: product.id,
          nama_snapshot: product.nama_id,
          quantity: 1,
          unit_price: product.unit_price,
          stock_available: product.stock_available,
        },
      ];
    });
  };

  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");

  const handleAddManual = () => {
    const name = manualName.trim();
    const price = Number(manualPrice);
    if (!name || !Number.isInteger(price) || price <= 0) {
      toast.error("Isi nama dan harga Rupiah bulat untuk item manual");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        source_type: "MANUAL",
        produk_id: `manual-${Date.now()}`,
        nama_snapshot: name,
        quantity: 1,
        unit_price: String(price),
        stock_available: 0,
      },
    ]);
    setManualName("");
    setManualPrice("");
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Item Batch</h3>
        <span className="text-xs text-muted-foreground">
          {items.length} item
        </span>
      </div>

      {allowCatalog && <Field className="gap-1">
        <FieldLabel>Cari Produk Katalog Bulky</FieldLabel>
        <InputGroup>
          <InputGroupInput
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            autoComplete="off"
          />
        </InputGroup>
      </Field>}

      <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_180px_auto]">
        <InputGroup>
          <InputGroupInput value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Nama item manual / dari supplier..." />
        </InputGroup>
        <InputGroup>
          <InputGroupInput value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} inputMode="numeric" placeholder="Harga satuan (Rp)" />
        </InputGroup>
        <Button type="button" variant="outline" onClick={handleAddManual}>
          <Plus className="size-3.5" /> Tambah Manual
        </Button>
        <p className="text-xs text-muted-foreground sm:col-span-3">
          Item manual tidak terhubung ke katalog atau stok Bulky. Pastikan ketersediaan supplier sebelum membuka lelang.
        </p>
      </div>

      {allowCatalog && <div className="border rounded-md overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left">Produk</th>
              <th className="px-3 py-2 text-right">Harga</th>
              <th className="px-3 py-2 text-right">Stok</th>
              <th className="px-3 py-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {options.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{p.nama_id}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatRupiah(p.unit_price)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {p.stock_available}
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={p.is_sold || p.stock_available <= 0}
                    onClick={() => handleAdd(p)}
                  >
                    <Plus className="size-3.5" />
                    Tambah
                  </Button>
                </td>
              </tr>
            ))}
            {!isPending && options.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                  Tidak ada produk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>}

      {items.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">Produk</th>
                <th className="px-3 py-2 text-right">Harga</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
              <tr key={item.produk_id} className="border-t">
                <td className="px-3 py-2"><div>{item.nama_snapshot}</div><span className="text-[10px] text-muted-foreground">{item.source_type === "MANUAL" ? "Input manual" : "Katalog Bulky"}</span></td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatRupiah(item.unit_price)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatRupiah(
                      String((Number(item.unit_price) || 0) * item.quantity),
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-destructive hover:opacity-80"
                      onClick={() =>
                        setItems((prev) =>
                          prev.filter((i) => i.produk_id !== item.produk_id),
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SummaryCards = ({
  grandTotal,
  totalQuantity,
  volumeM3,
  minBidAmount,
}: {
  grandTotal: number;
  totalQuantity: number;
  volumeM3: number;
  minBidAmount: number;
}) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">Grand Total</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {formatRupiah(grandTotal)}
      </p>
    </div>
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">Total Qty</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {totalQuantity}
      </p>
    </div>
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">Volume (m³)</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {volumeM3.toFixed(3)}
      </p>
    </div>
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">Min Bid (0.1%)</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {formatRupiah(minBidAmount)}
      </p>
    </div>
  </div>
);
