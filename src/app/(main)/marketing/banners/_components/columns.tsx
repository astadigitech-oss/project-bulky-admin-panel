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
  Circle,
  CircleDot,
  Clock,
  Edit,
  ImageOffIcon,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { MetaPagination } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { VariantProps } from "class-variance-authority";
import { PromoPartIType } from "../_api/types";
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
  handleChangeStatus,
  disabled,
}: {
  setOpen: Dispatch<SetStateAction<"edit" | "create" | null>>;
  metaPage: MetaPagination;
  setQuery: any;
  disabled: boolean;
  handleDelete: (user: string, userId: string) => Promise<void>;
  handleChangeStatus: (
    command: string,
    userId: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => Promise<void>;
}): ColumnDef<PromoPartIType>[] => [
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
    accessorKey: "is_visible",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center gap-2 text-xs bg-green-500/20 px-2 py-0.5 rounded-full font-medium w-fit",
          row.original.is_visible
            ? "bg-green-500/20 dark:bg-green-500/30 dark:text-emerald-100 text-emerald-600"
            : "bg-red-500/10 dark:bg-red-500/30 dark:text-red-200 text-red-600",
        )}
      >
        <div
          className={cn(
            "size-2 rounded-full",
            row.original.is_visible ? "bg-green-500" : "bg-red-500",
          )}
        />
        {row.original.is_visible ? "Aktif" : "Tidak Aktif"}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
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
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleChangeStatus(
                    row.original.is_visible
                      ? `Nonaktifkan ${row.original.nama}`
                      : `Aktifkan ${row.original.nama}`,
                    row.original.id,
                    row.original.is_visible ? "destructive" : "default",
                  )
                }
              >
                {row.original.is_visible ? (
                  <Circle className="size-3.5" />
                ) : (
                  <CircleDot className="size-3.5" />
                )}
                {row.original.is_visible ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setOpen("edit");
                  setQuery({ promoId: row.original.id });
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
      <DialogTrigger className="relative h-12 aspect-4/1 overflow-hidden rounded-md border">
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizesImage}
          className="object-cover"
          loading="eager"
        />
      </DialogTrigger>
      <DialogContent className={"min-w-[80vw]"} showCloseButton={false}>
        <div className="relative w-full aspect-4/1 overflow-hidden rounded-md border">
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
