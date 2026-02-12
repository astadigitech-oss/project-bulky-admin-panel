import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MetaPagination } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { ImageOffIcon } from "lucide-react";
import { ProductPartIType } from "../_api/types";
import Image from "next/image";
import { cn, formatImageAlt, sizesImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const column = ({
  metaPage,
}: {
  metaPage: MetaPagination;
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
              alt={formatImageAlt(row.original.nama)}
              fill
              sizes={sizesImage}
              className="object-cover"
            />
          </DialogTrigger>
          <DialogContent className={"min-w-[80vh]"} showCloseButton={false}>
            <div className="relative w-full aspect-square overflow-hidden rounded-md border">
              <Image
                src={row.original.gambar_utama}
                alt={formatImageAlt(row.original.nama)}
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
    accessorKey: "nama",
    header: () => <div className="flex items-center gap-2">Nama</div>,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center gap-2 text-xs bg-green-500/20 px-2 py-0.5 rounded-full font-medium w-fit",
          row.original.is_active
            ? "bg-green-500/20 dark:bg-green-500/30 dark:text-emerald-100 text-emerald-600"
            : "bg-red-500/10 dark:bg-red-500/30 dark:text-red-200 text-red-600",
        )}
      >
        <div
          className={cn(
            "size-2 rounded-full",
            row.original.is_active ? "bg-green-500" : "bg-red-500",
          )}
        />
        {row.original.is_active ? "Aktif" : "Tidak Aktif"}
      </div>
    ),
  },
];
