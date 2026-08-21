"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpRight,
  ChevronRight,
  Edit2,
  Eye,
  Package,
  RefreshCw,
  Trash,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useDeleteProduct, useGetProductDetail } from "@api/product/list";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { cn, formatRupiah } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Flag } from "@/components/column";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";
import { useConfirm } from "@/hooks/use-confirm";
import { Skeleton } from "@/components/ui/skeleton";
const PDFViewer = dynamic(() => import("@/components/ui/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 justify-center w-full aspect-[1/1.414] border">
      <Spinner className="size-3.5" />
      <p>Loading PDF...</p>
    </div>
  ),
});

export const ProductDetailClient = () => {
  const router = useRouter();
  const productId = useParams().productId as string;

  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus [name]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const {
    data: productDetail,
    refetch,
    isRefetching,
  } = useGetProductDetail({ id: productId });
  const detail = productDetail?.data;

  const handleDelete = async () => {
    const ok = await confirmDelete(detail?.nama_id ?? "", "name");
    if (!ok) return;
    deleteProduct(
      { params: { id: detail?.id } },
      { onSuccess: () => router.push("/products/list") },
    );
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-20">
      <DialogDelete />
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Link href={"/products/list"}>
            <Button variant={"ghost"} size={"icon-lg"}>
              <Package className="size-5" />
            </Button>
          </Link>
          <ChevronRight className="size-4" />
          <h1 className="leading-none font-semibold text-2xl">Detail Produk</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => refetch()}
            disabled={isDeleting}
          >
            <RefreshCw
              className={cn("size-3.5", isRefetching && "animate-spin")}
            />
          </Button>
          <Link href={`/products/list/${productId}/edit`}>
            <Button variant={"outline"} size={"icon"}>
              <Edit2 className="size-3.5" />
            </Button>
          </Link>
          <Button
            variant={"outlineDestructive"}
            size={"icon"}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash className="size-3.5" />
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold">Gambar</p>
          <div className="grid grid-cols-7 grid-rows-2 gap-3 w-full border rounded-lg p-3 border-gray-300 dark:border-gray-300/50">
            {detail
              ? detail.gambar.map((item, index) => (
                  <Dialog key={item.id}>
                    <DialogTrigger
                      render={
                        <Button
                          className={cn(
                            "relative w-full aspect-square rounded-md overflow-hidden shadow border border-gray-300/70 dark:border-gray-300/30 p-0 from-white to-white dark:from-black dark:to-black hover:from-white hover:to-white hover:dark:from-black hover:dark:to-black h-auto group",
                            index === 0 && "col-span-2 row-span-2",
                          )}
                        >
                          <div className="size-full bg-black/10 dark:bg-white/10 backdrop-blur-sm z-10 group-hover:flex items-center justify-center rounded-md hidden">
                            <div className="size-8 rounded-full bg-white dark:bg-black dark:text-white flex items-center justify-center">
                              <Eye className="size-4" />
                            </div>
                          </div>
                          <Image
                            src={item.gambar_url}
                            alt={`${detail.nama_id}_${item.id}`}
                            fill
                            className="object-cover"
                            loading="eager"
                          />
                        </Button>
                      }
                    />
                    <DialogContent
                      showCloseButton={false}
                      className={"h-[80vh] min-w-[80vh]"}
                    >
                      <DialogHeader>
                        <DialogTitle>Pratinjau Gambar Produk</DialogTitle>
                      </DialogHeader>
                      <div className="size-full relative aspect-square rounded-md overflow-hidden border shadow">
                        <Image
                          src={item.gambar_url}
                          alt={`${detail.nama_id}_${item.id}`}
                          fill
                          className="object-cover"
                          loading="eager"
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose
                          render={
                            <Button>
                              <XIcon /> Tutup
                            </Button>
                          }
                        />
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ))
              : Array.from({ length: 10 }, (_, i) => (
                  <Skeleton
                    key={i}
                    className={cn(
                      "w-full aspect-square",
                      i === 0 && "col-span-2 row-span-2",
                    )}
                  />
                ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3 flex flex-col gap-6">
            <div className="flex flex-col border rounded-lg border-gray-300 dark:border-gray-300/50 text-xs overflow-hidden">
              <div className="flex w-full min-h-8 border-b border-gray-300 dark:border-gray-300/50">
                <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                  Nama
                </p>
                <div className="w-full grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-300/50">
                  <div className="px-2 flex items-center gap-2 text-xs">
                    <Flag />
                    <p className="py-2">{detail?.nama_id}</p>
                  </div>
                  <div className="px-2 flex items-center gap-2 text-xs">
                    <Flag en />
                    <p className="py-2">{detail?.nama_en}</p>
                  </div>
                </div>
              </div>
              <div className="flex w-full min-h-8 border-b border-gray-300 dark:border-gray-300/50">
                <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                  ID Cargo
                </p>
                <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                  {detail?.id_cargo}
                </div>
              </div>
              <div className="flex w-full min-h-8 ">
                <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                  Discrepancy
                </p>
                <div className="flex flex-wrap gap-2 px-2 h-full items-center ">
                  <p className="py-2">
                    {detail?.discrepancy != null && detail.discrepancy !== "" ? `${detail.discrepancy}%` : "-"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col border rounded-lg border-gray-300 dark:border-gray-300/50 text-xs overflow-hidden">
              <div className="flex w-full min-h-8 border-b border-gray-300 dark:border-gray-300/50">
                <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                  Merek
                </p>
                <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                  {detail?.mereks.map((item) => (
                    <p
                      key={item.nama}
                      className="bg-black text-white dark:bg-white dark:text-black px-2 rounded-md py-0.5 h-fit"
                    >
                      {item.nama}
                    </p>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 w-full min-h-8 border-b border-gray-300 dark:border-gray-300/50">
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Kategori
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.kategori.nama}
                  </div>
                </div>
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Sumber
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.sumber?.nama ?? "-"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 w-full min-h-8 ">
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Kondisi Produk
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.kondisi.nama}
                  </div>
                </div>
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Kondisi Paket
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.kondisi_paket.nama}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col border rounded-lg border-gray-300 dark:border-gray-300/50 text-xs overflow-hidden">
              <div className="grid grid-cols-2 w-full min-h-8 border-b border-gray-300 dark:border-gray-300/50">
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Harga Awal
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {formatRupiah(detail?.harga_sebelum_diskon ?? 0)}
                  </div>
                </div>
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Harga Diskon
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {formatRupiah(detail?.harga_sesudah_diskon ?? 0)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 w-full min-h-8 ">
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Jml. Item Palet
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.quantity}
                  </div>
                </div>
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Status Terjual
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.is_sold ? "Terjual" : "Tersedia"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col border rounded-lg border-gray-300 dark:border-gray-300/50 text-xs overflow-hidden">
              <div className="grid grid-cols-2 w-full min-h-8 border-b border-gray-300 dark:border-gray-300/50">
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Panjang
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.panjang.toLocaleString()} cm
                  </div>
                </div>
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Tinggi
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.tinggi.toLocaleString()} cm
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 w-full min-h-8 border-b border-gray-300 dark:border-gray-300/50">
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Lebar
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.lebar.toLocaleString()} cm
                  </div>
                </div>
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Berat
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.berat.toLocaleString()} kg
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 w-full min-h-8">
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Volume
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {(
                      (detail?.panjang ?? 0) *
                      (detail?.lebar ?? 0) *
                      (detail?.tinggi ?? 0)
                    ).toLocaleString()}{" "}
                    cm&sup3; /{" "}
                    {(
                      ((detail?.panjang ?? 0) *
                        (detail?.lebar ?? 0) *
                        (detail?.tinggi ?? 0)) /
                      1_000_000
                    ).toLocaleString()}{" "}
                    m&sup3;
                  </div>
                </div>
                <div className="flex w-full">
                  <p className="w-32 bg-gray-100 dark:bg-gray-800 h-full flex items-center px-2 font-semibold flex-none">
                    Berat Volumetrik
                  </p>
                  <div className="flex flex-wrap gap-2 px-2 h-full items-center py-1.25">
                    {detail?.berat_volumetrik.toLocaleString()} kg
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 flex-col gap-6 flex">
            <div className="flex flex-col text-xs rounded-lg overflow-hidden border border-gray-300 dark:border-gray-300/50">
              <div className="bg-gray-100 dark:bg-gray-800 min-h-8 flex items-center justify-between px-2">
                <p>Referensi Id</p>
                <Link href={"#"}>
                  <Button size={"icon-xs"} variant={"ghost"}>
                    <ArrowUpRight />
                  </Button>
                </Link>
              </div>
              <p className="flex items-center min-h-8 flex-wrap px-2">
                {detail?.reference_id}
              </p>
            </div>
            <div className="flex flex-col text-xs rounded-lg overflow-hidden border border-gray-300 dark:border-gray-300/50">
              <p className="bg-gray-100 dark:bg-gray-800 min-h-8 flex items-center px-2">
                File PDF
              </p>
              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      className={
                        "rounded-none from-white to-white hover:from-yellow-100 hover:to-yellow-100 dark:from-black dark:to-black hover:dark:from-yellow-500 hover:dark:to-yellow-500 text-xs justify-between font-normal border-0 dark:text-white dark:hover:text-black"
                      }
                    >
                      Lihat File
                      <Eye className="size-3.5" />
                    </Button>
                  }
                />
                <DialogContent
                  showCloseButton={false}
                  className={"sm:min-w-lg w-full"}
                >
                  <DialogHeader>
                    <DialogTitle>PDF Preview</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center justify-center rounded-md overflow-hidden shadow">
                    <PDFViewer file={detail?.dokumen[0]?.file_url} />
                  </div>
                  <DialogFooter>
                    <DialogClose
                      render={
                        <Button type="button">
                          <XIcon />
                          Tutup
                        </Button>
                      }
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-col text-xs rounded-lg overflow-hidden border border-gray-300 dark:border-gray-300/50">
              <p className="bg-gray-100 dark:bg-gray-800 min-h-8 flex items-center px-2">
                Status
              </p>
              <div className="flex items-center min-h-8 flex-wrap px-2 gap-2">
                <div
                  className={cn(
                    "size-2 rounded-full",
                    detail?.is_active ? "bg-green-500" : "bg-red-500",
                  )}
                />
                {detail?.is_active ? "Publish" : "Draft"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
