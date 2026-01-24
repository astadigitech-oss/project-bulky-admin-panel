import { Skeleton } from "../ui/skeleton";

export const TableLoader = ({ length = 5 }: { length?: number }) => {
  return (
    <div className="overflow-hidden rounded-md border dark:border-gray-500/50">
      <div className="h-10 border-b w-full grid grid-cols-4 items-center gap-4 px-3 bg-card">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="w-full h-4 rounded  dark:bg-gray-700" />
        ))}
      </div>
      {Array.from({ length }, (_, i) => (
        <div
          key={i}
          className="h-10 border-b last:border-b-0 w-full grid grid-cols-4 items-center gap-4 px-3"
        >
          {Array.from({ length: 4 }, (_, j) => (
            <Skeleton key={j} className="w-full h-4 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
};
