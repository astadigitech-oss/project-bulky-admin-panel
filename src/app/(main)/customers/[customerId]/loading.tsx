import { MainContainer } from "@/components/container/main-container";
import { HeaderLoader } from "@/components/loaders/header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User2 } from "lucide-react";

const label = "Pelanggan";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: label }, { label: `Detail` }]}>
      <div className="flex flex-col gap-6 pt-4">
        <HeaderLoader
          isDetail
          title={`Detail ${label}`}
          icon={User2}
          withTitle={false}
        />
        <Card className="p-0 border-gray-300/80 dark:border-gray-600/70 ring-0 border gap-0 h-45 overflow-hidden bg-background">
          <Skeleton className="h-24 rounded-none" />
        </Card>
        <div className="grid grid-cols-2 w-full gap-6">
          <Card className="p-0 border-gray-300/80 dark:border-gray-600/70 ring-0 border gap-0 h-42 overflow-hidden bg-background">
            <Skeleton className="h-13.5 rounded-none flex-none" />
            <div className="p-4 size-full">
              <Skeleton className="size-full" />
            </div>
          </Card>
          <Card className="p-0 border-gray-300/80 dark:border-gray-600/70 ring-0 border gap-0 h-42 overflow-hidden bg-background">
            <Skeleton className="h-13.5 rounded-none flex-none" />
            <div className="p-4 size-full">
              <Skeleton className="size-full" />
            </div>
          </Card>
        </div>
      </div>
    </MainContainer>
  );
};

export default Loading;
