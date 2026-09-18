import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatImageAlt, sizesImage } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import GB from "country-flag-icons/react/3x2/GB";
import ID from "country-flag-icons/react/3x2/ID";
import { Clock, Edit, ImageOffIcon, MoreHorizontal, Trash } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { MetaPagination } from "@/lib/types";
import { AuctionEducationBanner } from "../_api/types";

export const columns = ({
  metaPage,
  setOpen,
  setQuery,
  handleDelete,
  disabled,
}: {
  metaPage: MetaPagination;
  setOpen: Dispatch<SetStateAction<"create" | "edit" | null>>;
  setQuery: (values: { bannerId: string }) => void;
  handleDelete: (name: string, id: string) => Promise<void>;
  disabled: boolean;
}): ColumnDef<AuctionEducationBanner>[] => [
  {
    id: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {metaPage.from + row.index}
      </div>
    ),
  },
  {
    accessorKey: "gambar_url.id",
    header: () => (
      <div className="flex items-center gap-2">
        Banner <ID className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
    cell: ({ row }) => (
      <DialogPreview
        url={row.original.gambar_url.id}
        alt={`${formatImageAlt(row.original.nama)}_id`}
      />
    ),
  },
  {
    accessorKey: "gambar_url.en",
    header: () => (
      <div className="flex items-center gap-2">
        Banner <GB className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
    cell: ({ row }) => (
      <DialogPreview
        url={row.original.gambar_url.en ?? ""}
        alt={`${formatImageAlt(row.original.nama)}_en`}
      />
    ),
  },
  { accessorKey: "nama", header: "Nama" },
  {
    accessorKey: "urutan",
    header: "Urutan",
    cell: ({ row }) => (
      <div className="tabular-nums">{row.original.urutan}</div>
    ),
  },
  {
    id: "schedule",
    header: "Jadwal",
    cell: ({ row }) => {
      const { tanggal_mulai: start, tanggal_selesai: end } = row.original;
      if (!start && !end)
        return (
          <span className="text-xs text-muted-foreground">Tanpa jadwal</span>
        );
      return (
        <span className="text-xs">
          {start ? format(start, "dd MMM yyyy", { locale: id }) : "-"} —{" "}
          {end ? format(end, "dd MMM yyyy", { locale: id }) : "Seterusnya"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <TooltipText
          value={
            <div className="flex flex-col gap-1 text-xs">
              <span>Diupdate:</span>
              <strong>
                {format(row.original.updated_at, "PPpp", { locale: id })}
              </strong>
            </div>
          }
          render={
            <Button variant="ghost" size="icon-xs">
              <Clock />
            </Button>
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={disabled}
            className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
          >
            <MoreHorizontal />
            <span className="sr-only">Toggle aksi</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => {
                  setOpen("edit");
                  setQuery({ bannerId: row.original.id });
                }}
              >
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                variant="destructive"
                onClick={() => handleDelete(row.original.nama, row.original.id)}
              >
                <Trash className="size-3.5" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

const DialogPreview = ({ url, alt }: { url: string; alt: string }) => {
  if (!url)
    return (
      <div className="flex size-12 items-center justify-center rounded-md border">
        <ImageOffIcon className="size-5 stroke-[1.5]" />
      </div>
    );
  return (
    <Dialog>
      <DialogTrigger className="relative h-12 aspect-4/1 overflow-hidden rounded-md border">
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizesImage}
          className="object-cover"
        />
      </DialogTrigger>
      <DialogContent className="min-w-[80vw]" showCloseButton={false}>
        <div className="relative aspect-4/1 w-full overflow-hidden rounded-md border">
          <Image
            src={url}
            alt={alt}
            fill
            sizes={sizesImage}
            className="object-cover"
          />
        </div>
        <DialogFooter>
          <DialogClose render={<Button>Tutup</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
