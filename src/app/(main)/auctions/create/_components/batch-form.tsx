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
import { ArrowLeft, ChevronRight, Plus, Save, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { cn, formatRupiah } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
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
  AuctionProductOption,
} from "../../_api/types";

const formSchema = z.object({
  nama_id: z.string().min(1, "Nama ID wajib diisi"),
  nama_en: z.string().optional(),
  description: z.string().optional(),
  warehouse_id: z.string().optional(),
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
  produk_id: string;
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
  const [pdf, setPdf] = useState<UploadedAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_id: "",
      nama_en: "",
      description: "",
      warehouse_id: "",
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
      warehouse_id: batch.warehouse_id ?? "",
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
        produk_id: i.produk_id,
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

  const [panjangCm, lebarCm, tinggiCm, beratKg, discrepancy] = useWatch({
    control: form.control,
    name: [
      "panjang_cm",
      "lebar_cm",
      "tinggi_cm",
      "berat_kg",
      "discrepancy_percentage",
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
  const isDisabled = isSaving || isPublishing || isUploading;

  const handleImageChange = async (files: File[]) => {
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
      setUploading(false);
    }
  };

  const handlePdfChange = async (files: File[]) => {
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
      setUploading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    const body: AuctionDraftInput = {
      nama_id: values.nama_id,
      nama_en: values.nama_en || null,
      description: values.description || null,
      warehouse_id: values.warehouse_id || null,
      kategori_id: values.kategori_id || null,
      kondisi_id: values.kondisi_id || null,
      kondisi_paket_id: values.kondisi_paket_id || null,
      sumber_id: values.sumber_id || null,
      discrepancy_percentage: values.discrepancy_percentage || "0",
      merek_ids: values.merek_ids,
      items: items.map((i) => ({ produk_id: i.produk_id, quantity: i.quantity })),
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
      <div className="flex items-center gap-2">
        <Link href={batchId ? `/auctions/${batchId}` : "/auctions/list"}>
          <Button variant="ghost" size="icon-lg">
            <ArrowLeft className="size-5" />
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
          <div className="max-w-3xl mx-auto grid w-full gap-6">
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

            <div className="grid gap-4 lg:grid-cols-2">
              <Controller
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
              />
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

          <div className="grid gap-6 lg:grid-cols-2">
            <Field className="gap-1">
              <FieldLabel>Gambar (1-10)</FieldLabel>
              <DropzoneList
                onChange={handleImageChange}
                value={[]}
                maxFiles={10}
                maxSize={5 * 1024 * 1024}
                accept={{ "image/jpeg": [], "image/png": [], "image/webp": [] }}
              />
            </Field>
            <Field className="gap-1">
              <FieldLabel>PDF (Opsional)</FieldLabel>
              <DropzonePDF onChange={handlePdfChange} value={[]} />
            </Field>
          </div>

          <ItemPicker items={items} setItems={setItems} />

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
}: {
  items: BatchItem[];
  setItems: React.Dispatch<React.SetStateAction<BatchItem[]>>;
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
          produk_id: product.id,
          nama_snapshot: product.nama_id,
          quantity: 1,
          unit_price: product.unit_price,
          stock_available: product.stock_available,
        },
      ];
    });
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Produk</h3>
        <span className="text-xs text-muted-foreground">
          {items.length} item
        </span>
      </div>

      <Field className="gap-1">
        <FieldLabel>Cari Produk</FieldLabel>
        <InputGroup>
          <InputGroupInput
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            autoComplete="off"
          />
        </InputGroup>
      </Field>

      <div className="border rounded-md overflow-hidden">
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
      </div>

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
                  <td className="px-3 py-2">{item.nama_snapshot}</td>
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
