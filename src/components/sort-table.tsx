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
              className: "flex-none",
            })}
          >
            <ArrowDownUp className="size-3.5" />
          </DropdownMenuTrigger>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort</DropdownMenuLabel>
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
              Created
            </DropdownMenuCheckboxItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setSort({ order: "asc" })}
            className="h-7 text-xs"
          >
            Order asc
            {order === "asc" && <ArrowUp className="size-3.5 ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setSort({ order: "desc" })}
            className="h-7 text-xs"
          >
            Order desc
            {order === "desc" && <ArrowDown className="size-3.5 ml-auto" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
