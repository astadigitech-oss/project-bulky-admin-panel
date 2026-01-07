import { buttonVariants } from "./ui/button";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TooltipText } from "@/providers/tooltip-provider";
import { cn } from "@/lib/utils";

export const SortTable = ({
  order,
  sort,
  setSort,
  data,
  disabled,
  isCustom,
}: {
  order: string;
  sort: string;
  setSort: any;
  data: { name: string; value: string }[];
  disabled?: boolean;
  isCustom?: boolean;
}) => {
  return (
    <DropdownMenu>
      <TooltipText
        value="Urutkan"
        render={
          <DropdownMenuTrigger
            disabled={disabled}
            className={buttonVariants({
              variant: "outline",
              size: "icon",
              className: "flex-none border border-black",
            })}
          >
            <ArrowDownUp className="size-3.5" />
          </DropdownMenuTrigger>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Urutkan</DropdownMenuLabel>
          {data.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.value}
              onCheckedChange={() => setSort({ sort: item.value })}
              className="h-7 text-xs"
              checked={sort === item.value}
            >
              {item.name}
            </DropdownMenuCheckboxItem>
          ))}
          {!isCustom && (
            <DropdownMenuCheckboxItem
              onCheckedChange={() => setSort({ sort: "created" })}
              className="h-7 text-xs group"
              checked={sort === "created"}
            >
              Dibuat
            </DropdownMenuCheckboxItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setSort({ order: "asc" })}
            className="h-7 text-xs whitespace-nowrap"
          >
            Menaik (A-Z)
            <ArrowUp
              className={cn(
                "size-3.5 ml-auto",
                order === "asc" ? "opacity-100" : "opacity-0 ",
              )}
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setSort({ order: "desc" })}
            className="h-7 text-xs whitespace-nowrap"
          >
            Menurun (Z-A)
            <ArrowDown
              className={cn(
                "size-3.5 ml-auto",
                order === "desc" ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
