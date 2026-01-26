import { MainContainer } from "@/components/container/main-container";
import { HeaderLoader } from "@/components/loaders/header";
import { PaginationLoader } from "@/components/loaders/pagination";
import { TableLoader } from "@/components/loaders/table";
import { Skeleton } from "@/components/ui/skeleton";

const label = "Pelanggan";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: label }]}>
      <div className="flex flex-col gap-6 pt-4">
        <HeaderLoader title={label} withTitle={false} />
        <div className="grid grid-cols-8 grid-rows-3 xl:grid-rows-2 gap-4">
          <Skeleton className="col-span-8 row-span-2 h-74 xl:col-span-6" />
          <Skeleton className="h-full xl:col-span-2 col-span-4" />
          <Skeleton className="h-full xl:col-span-1 col-span-2" />
          <Skeleton className="h-full xl:col-span-1 col-span-2" />
        </div>
        <HeaderLoader justTitle={false} canCreated={false} />
        <TableLoader />
        <PaginationLoader />
      </div>
    </MainContainer>
  );
};

export default Loading;
