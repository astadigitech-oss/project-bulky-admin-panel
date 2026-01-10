import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Item } from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  cn,
  getRangeOfMonths,
  getRangeOfWeeks,
  getRangeOfYears,
  startMonth,
  today,
} from "@/lib/utils";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon } from "lucide-react";
import { format, getMonth, getWeekOfMonth, subMonths } from "date-fns";
import { RadioItem } from "./_sub-section/radio";
import { useGetBuyerChart } from "../../_api";
import { id } from "date-fns/locale";

const chartConfig = {
  user: {
    label: "User",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const ChartBuyer = () => {
  const { open: openSidebar } = useSidebar();

  const [isOpen, setIsOpen] = useState(false);
  const [rangeDate, setRangeDate] = useState<DateRange | undefined>({
    from: startMonth,
    to: today,
  });
  const [typeChart, setTypeChart] = useState<
    "year" | "month" | "week" | "custom"
  >();
  const [valueYear, setValueYear] = useState<number>();
  const [valueMonth, setValueMonth] =
    useState<ReturnType<typeof getRangeOfMonths>[number]>();
  const [valueWeek, setValueWeek] =
    useState<ReturnType<typeof getRangeOfWeeks>["range"][number]>();

  const { data: chartData } = useGetBuyerChart({
    filter: typeChart ? typeChart : undefined,
    bulan: typeChart === "month" && valueMonth ? valueMonth.num : undefined,
    minggu: typeChart === "week" && valueWeek ? valueWeek.week : undefined,
    tahun: typeChart === "year" && valueYear ? valueYear : undefined,
    tanggal_dari:
      typeChart === "custom"
        ? rangeDate?.from
          ? format(rangeDate.from, "yyyy-MM-dd")
          : format(startMonth, "yyyy-MM-dd")
        : undefined,
    tanggal_sampai:
      typeChart === "custom"
        ? rangeDate?.to
          ? format(rangeDate.to, "yyyy-MM-dd")
          : format(startMonth, "yyyy-MM-dd")
        : undefined,
  });

  const chartList = chartData?.data.chart ?? [];

  return (
    <Card
      className={cn(
        "col-span-8 row-span-2",
        openSidebar ? "2xl:col-span-6" : "xl:col-span-6",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <Item className="flex flex-col items-start p-0 gap-1">
          <CardTitle>Total Pelanggan</CardTitle>
          <CardDescription>
            Jumlah pelanggan pada periode tertentu.
          </CardDescription>
        </Item>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button>
                <CalendarDaysIcon className="size-3.5" />
                {typeChart === "year"
                  ? `Tahun ${valueYear}`
                  : typeChart === "month"
                    ? `Bulan ${valueMonth?.month}`
                    : typeChart === "week" && valueWeek?.start && valueWeek.end
                      ? `Minggu ke-${valueWeek.week} | ${format(valueWeek.start, "PP", { locale: id })} - ${format(valueWeek.end, "PP", { locale: id })}`
                      : typeChart === "custom" &&
                          rangeDate?.from &&
                          rangeDate?.to
                        ? `${format(rangeDate.from, "PP", { locale: id })} - ${format(rangeDate.to, "PP", { locale: id })}`
                        : "Select Range"}
              </Button>
            }
          />
          <DialogContent className={"w-auto min-w-lg"} showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Pilih Periode</DialogTitle>
            </DialogHeader>
            <div>
              <RadioGroup
                value={typeChart ? typeChart : "year"}
                onValueChange={(v) => {
                  setTypeChart(v as "year" | "month" | "week" | "custom");
                  setValueYear(v === "year" ? getRangeOfYears()[0] : undefined);
                  setValueMonth(
                    v === "month"
                      ? getRangeOfMonths().find(
                          (v) => v.num === getMonth(today) + 1,
                        )
                      : undefined,
                  );
                  setValueWeek(
                    v === "week"
                      ? getRangeOfWeeks()["range"].find(
                          (w) => w.week === getWeekOfMonth(today),
                        )
                      : undefined,
                  );
                }}
              >
                <RadioItem label="Tahun" value="year" type={typeChart}>
                  <div className="p-3 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-3">
                    <p>Pilih tahun:</p>
                    <Select
                      value={
                        typeChart === "year" && valueYear
                          ? valueYear
                          : getRangeOfYears()[0]
                      }
                      onValueChange={(e) => setValueYear(e ?? undefined)}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getRangeOfYears().map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </RadioItem>
                <RadioItem label="Bulan" value="month" type={typeChart}>
                  <div className="p-3 text-gray-700 dark:text-gray-300 flex items-center gap-3">
                    <p>Pilih Bulan:</p>
                    <Select
                      value={
                        typeChart === "month" && valueMonth
                          ? valueMonth
                          : getRangeOfMonths().find(
                              (v) => v.num === getMonth(today) + 1,
                            )
                      }
                      onValueChange={(v) => setValueMonth(v ?? undefined)}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue>
                          {(e: ReturnType<typeof getRangeOfMonths>[number]) =>
                            e.month
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {getRangeOfMonths().map((month) => (
                          <SelectItem key={month.num} value={month}>
                            {month.month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </RadioItem>
                <RadioItem label="Minggu" value="week" type={typeChart}>
                  <div className="p-3 text-gray-700 dark:text-gray-300 flex items-center gap-3">
                    <p>Pilih Minggu:</p>
                    <Select
                      value={
                        typeChart === "week" && valueWeek
                          ? valueWeek
                          : getRangeOfWeeks()["range"].find(
                              (w) => w.week === getWeekOfMonth(today),
                            )
                      }
                      onValueChange={(v) => setValueWeek(v ?? undefined)}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue>
                          {(
                            e: ReturnType<
                              typeof getRangeOfWeeks
                            >["range"][number],
                          ) => (
                            <div className="flex items-center gap-2">
                              <p className="text-xs">Ke-{e.week}</p>
                              <span className="text-xs text-gray-700 dark:text-gray-300">
                                {e.start} - {e.end}
                              </span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className={"w-auto"}>
                        {getRangeOfWeeks().range.map((week) => (
                          <SelectItem key={week.week} value={week}>
                            <p className="text-xs">Ke-{week.week}</p>
                            <span className="text-xs text-gray-700 dark:text-gray-300 w-fit ml-auto bg-gray-100 dark:bg-gray-700 px-2 rounded">
                              {week.start} - {week.end}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </RadioItem>
                <RadioItem label="Custom" value="custom" type={typeChart}>
                  <div className="p-3 text-gray-700 dark:text-gray-300 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p>Pilih Range Tanggal:</p>
                      <p className="bg-gray-100 dark:bg-gray-700 px-2 rounded py-0.5">
                        {rangeDate?.from && rangeDate?.to
                          ? `${format(rangeDate?.from, "dd MMM yyyy")} - ${format(rangeDate?.to, "dd MMM yyyy")}`
                          : "-"}
                      </p>
                    </div>
                    <div className="p-1 rounded-md overflow-hidden bg-background flex items-center justify-center w-full border border-gray-300 dark:border-gray-500/70">
                      <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={rangeDate}
                        defaultMonth={subMonths(today, 1)}
                        onSelect={setRangeDate}
                        disabled={{
                          after: today,
                        }}
                      />
                    </div>
                  </div>
                </RadioItem>
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setTypeChart(undefined);
                }}
                variant={"outline"}
              >
                Reset
              </Button>
              <Button onClick={() => setIsOpen(false)}>Selesai</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-50 w-full">
          <LineChart
            accessibilityLayer
            data={chartList}
            margin={{
              top: 12,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={"preserveStartEnd"}
              padding={{ left: 20, right: 20 }}
              tickFormatter={(value) =>
                format(
                  new Date(value),
                  !typeChart || typeChart === "year" ? "MMM" : "PP",
                  { locale: id },
                )
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(e) =>
                    format(
                      e,
                      !typeChart || typeChart === "year" ? "MMMM" : "PP",
                      { locale: id },
                    )
                  }
                />
              }
            />
            <Line
              dataKey="user"
              type="natural"
              stroke="var(--color-user)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
