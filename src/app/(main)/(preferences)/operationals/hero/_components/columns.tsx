import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatImageAlt, sizesImage } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarIcon,
  CalendarOff,
  Clock,
  Edit,
  ImageOffIcon,
  Monitor,
  MonitorOff,
  MoreHorizontal,
  Star,
  Trash,
} from "lucide-react";
import { MetaPagination } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { HeroPartIType } from "../_api/types";
import GB from "country-flag-icons/react/3x2/GB";
import ID from "country-flag-icons/react/3x2/ID";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export const column = ({
  setOpen,
  metaPage,
  setQuery,
  handleDelete,
  handleMakeDefault,
  disabled,
}: {
  setOpen: Dispatch<SetStateAction<"edit" | "create" | null>>;
  metaPage: MetaPagination;
  setQuery: any;
  disabled: boolean;
  handleMakeDefault: (command: string, userId: string) => Promise<void>;
  handleDelete: (user: string, userId: string) => Promise<void>;
}): ColumnDef<HeroPartIType>[] => [
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
    accessorKey: "gambar_url.id",
    header: () => (
      <div className="flex items-center gap-2">
        Banner <ID className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
    cell: ({ row }) => {
      if (!row.original.gambar_url.id) {
        return (
          <div className="size-12 border rounded-md flex items-center justify-center">
            <ImageOffIcon className="size-6 stroke-[1.5]" />
          </div>
        );
      }
      return (
        <DialogPreview
          url={row.original.gambar_url.id}
          alt={`${formatImageAlt(row.original.nama)}_id`}
        />
      );
    },
  },
  {
    accessorKey: "gambar_url.en",
    header: () => (
      <div className="flex items-center gap-2">
        Banner <GB className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
    cell: ({ row }) => {
      if (!row.original.gambar_url.en) {
        return (
          <div className="size-12 border rounded-md flex items-center justify-center">
            <ImageOffIcon className="size-6 stroke-[1.5]" />
          </div>
        );
      }
      return (
        <DialogPreview
          url={row.original.gambar_url.en}
          alt={`${formatImageAlt(row.original.nama)}_en`}
        />
      );
    },
  },
  {
    accessorKey: "nama",
    header: "Nama",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <TooltipText
          value={row.original.is_default ? "Banner Utama" : "Banner Event"}
          render={
            <Button
              variant={"ghost"}
              size={"icon-xs"}
              className={"hover:bg-transparent dark:bg-transparent"}
            >
              <Star
                className={cn(
                  "stroke-0 stroke-transparent size-4",
                  row.original.is_default ? "fill-yellow-500" : "fill-gray-200",
                )}
              />
            </Button>
          }
        />
        <TooltipText
          value={row.original.is_visible ? "Ditampilkan" : "Disembunyikan"}
          render={
            <Button
              variant={"ghost"}
              size={"icon-xs"}
              className={"hover:bg-transparent dark:bg-transparent"}
            >
              {row.original.is_visible ? (
                <Monitor className="size-3.5" />
              ) : (
                <MonitorOff className="size-3.5 text-gray-400" />
              )}
            </Button>
          }
        />
        <TooltipText
          value={
            row.original.is_default ||
            row.original.tanggal_mulai ||
            row.original.tanggal_selesai
              ? "Tanggal telah diatur"
              : "Tanggal belum diatur"
          }
          render={
            <Button
              variant={"ghost"}
              size={"icon-xs"}
              className={"hover:bg-transparent dark:bg-transparent"}
              disabled={row.original.is_default}
            >
              {row.original.is_default ||
              row.original.tanggal_mulai ||
              row.original.tanggal_selesai ? (
                <CalendarIcon className="size-3.5" />
              ) : (
                <CalendarOff className="size-3.5 text-gray-400" />
              )}
            </Button>
          }
        />
        <TooltipText
          value={
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <div className="text-xs">Di update:</div>
                <div className="text-xs font-semibold">
                  {format(row.original.updated_at, "PPpp", { locale: id })}
                </div>
              </div>
            </div>
          }
          render={
            <Button variant={"ghost"} size={"icon-xs"}>
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
            <span className="sr-only">toggle action</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={"w-auto"}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className={"text-xs whitespace-nowrap"}
                onClick={() =>
                  handleMakeDefault(row.original.nama, row.original.id)
                }
                disabled={row.original.is_default}
              >
                <Star className="size-4 fill-yellow-500 stroke-0" />
                Jadikan Banner Utama
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setOpen("edit");
                  setQuery({ heroId: row.original.id });
                }}
              >
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => handleDelete(row.original.nama, row.original.id)}
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

const DialogPreview = ({ url, alt }: { url: string; alt: string }) => {
  return (
    <Dialog>
      <DialogTrigger className="relative h-12 aspect-2/1 overflow-hidden rounded-md border">
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizesImage}
          className="object-cover"
        />
      </DialogTrigger>
      <DialogContent className={"min-w-[80vw]"} showCloseButton={false}>
        <div className="relative w-full aspect-2/1 overflow-hidden rounded-md border">
          <Image
            src={url}
            alt={alt}
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
};
