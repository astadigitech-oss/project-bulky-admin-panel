import { Skeleton } from "@/components/ui/skeleton";

export const LoadingData = () => {
  return (
    <div className="flex items-center justify-between gap-4 w-full border-b last:border-0 border-gray-300 dark:border-gray-500/50 h-10 pl-5 pr-1">
      <div className="w-full flex items-center relative before:content-[''] before:absolute before:-left-2.5 before:w-1 before:h-6 before:rounded-full before:bg-yellow-400">
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-4 w-1/5 mr-2" />
    </div>
  );
};
