import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MetaPagination } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  Circle,
  CircleDot,
  Edit,
  EyeIcon,
  EyeOff,
  ImageOffIcon,
  MoreHorizontal,
  ReceiptText,
  Tag,
  Tags,
  Trash,
  XIcon,
} from "lucide-react";
import { ProductPartIType } from "../_api/types";
import Image from "next/image";
import { cn, formatImageAlt, sizesImage } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { HeaderDuoLang } from "@/components/column";
import { TooltipText } from "@/providers/tooltip-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
const PDFViewer = dynamic(() => import("@/components/ui/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 justify-center w-full aspect-[1/1.414] border">
      <Spinner className="size-3.5" />
      <p>Loading PDF...</p>
    </div>
  ),
});

export const column = ({
  metaPage,
  handleDelete,
  handleChanngeStatus,
  handleChangeSale,
  isDisabled,
}: {
  metaPage: MetaPagination;
  handleDelete: (id: string, value: string) => Promise<void>;
  handleChanngeStatus: (
    id: string,
    value: string,
    status: boolean,
  ) => Promise<void>;
  handleChangeSale: (
    id: string,
    value: string,
    isSale: boolean,
  ) => Promise<void>;
  isDisabled: boolean;
}): ColumnDef<ProductPartIType>[] => [
  {
    id: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "gambar_utama",
    header: "Gambar",
    cell: ({ row }) => {
      if (!row.original.gambar_utama) {
        return (
          <div className="size-12 border rounded-md flex items-center justify-center">
            <ImageOffIcon className="size-6 stroke-[1.5]" />
          </div>
        );
      }
      return (
        <Dialog>
          <DialogTrigger className="relative size-12 overflow-hidden rounded-md border">
            <Image
              src={row.original.gambar_utama}
              alt={formatImageAlt(row.original.nama_id)}
              fill
              sizes={sizesImage}
              className="object-cover"
              loading="eager"
            />
          </DialogTrigger>
          <DialogContent className={"min-w-[80vh]"} showCloseButton={false}>
            <div className="relative w-full aspect-square overflow-hidden rounded-md border">
              <Image
                src={row.original.gambar_utama}
                alt={formatImageAlt(row.original.nama_id)}
                fill
                sizes={sizesImage}
                className="object-cover"
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button>Close</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "nama_id",
    header: () => <HeaderDuoLang title="Nama" />,
  },
  {
    accessorKey: "nama_en",
    header: () => <HeaderDuoLang title="Name" en />,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center gap-2 text-xs bg-green-500/20 px-2 py-0.5 rounded-full font-medium w-fit",
          row.original.status
            ? "bg-green-500/20 dark:bg-green-500/30 dark:text-emerald-100 text-emerald-600"
            : "bg-red-500/10 dark:bg-red-500/30 dark:text-red-200 text-red-600",
        )}
      >
        <div
          className={cn(
            "size-2 rounded-full",
            row.original.status ? "bg-green-500" : "bg-red-500",
          )}
        />
        {row.original.status ? "Publish" : "Draft"}
      </div>
    ),
  },
  {
    accessorKey: "is_sold",
    header: "Status Produk",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center gap-2 text-xs px-2 py-0.5 rounded-full font-medium w-fit",
          row.original.is_sold
            ? "bg-red-500/10 dark:bg-red-500/30 dark:text-red-200 text-red-600"
            : "bg-green-500/20 dark:bg-green-500/30 dark:text-emerald-100 text-emerald-600",
        )}
      >
        <div
          className={cn(
            "size-2 rounded-full",
            row.original.is_sold ? "bg-red-500" : "bg-green-500",
          )}
        />
        {row.original.is_sold ? "Terjual" : "Tersedia"}
      </div>
    ),
  },
  {
    accessorKey: "is_sale",
    header: "Label Sale",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center gap-2 text-xs px-2 py-0.5 rounded-full font-medium w-fit",
          row.original.is_sale
            ? "bg-orange-500/20 dark:bg-orange-500/30 dark:text-orange-100 text-orange-600"
            : "bg-muted text-muted-foreground",
        )}
      >
        <div
          className={cn(
            "size-2 rounded-full",
            row.original.is_sale ? "bg-orange-500" : "bg-muted-foreground",
          )}
        />
        {row.original.is_sale ? "Aktif" : "Nonaktif"}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Dialog>
          <TooltipText
            value={"Lihat PDF"}
            render={
              <DialogTrigger
                render={
                  <Button
                    variant={"ghost"}
                    size={"icon-xs"}
                    disabled={!row.original.file_pdf}
                  >
                    {row.original.file_pdf ? <EyeIcon /> : <EyeOff />}
                  </Button>
                }
              />
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
              <PDFViewer file={row.original.file_pdf} />
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
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isDisabled}
            className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
          >
            <MoreHorizontal />
            <span className="sr-only">toggle action</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleChanngeStatus(
                    row.original.id,
                    row.original.nama_id,
                    !row.original.status,
                  )
                }
              >
                {row.original.status ? (
                  <Circle className="size-3.5" />
                ) : (
                  <CircleDot className="size-3.5" />
                )}
                {row.original.status ? "Draft" : "Publish"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleChangeSale(
                    row.original.id,
                    row.original.nama_id,
                    !row.original.is_sale,
                  )
                }
              >
                {row.original.is_sale ? (
                  <Tags className="size-3.5" />
                ) : (
                  <Tag className="size-3.5" />
                )}
                {row.original.is_sale ? "Nonaktifkan Sale" : "Aktifkan Sale"}
              </DropdownMenuItem>
              <Link href={`/products/list/${row.original.id}`}>
                <DropdownMenuItem className={"text-xs"}>
                  <ReceiptText className="size-3.5" />
                  Detail
                </DropdownMenuItem>
              </Link>
              <Link href={`/products/list/${row.original.id}/edit`}>
                <DropdownMenuItem className={"text-xs"}>
                  <Edit className="size-3.5" />
                  Edit
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleDelete(row.original.id, row.original.nama_id)
                }
                variant="destructive"
              >
                <Trash className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
