import { MainContainer } from "@/components/container/main-container";
import { HeaderLoader } from "@/components/loaders/header";
import { Skeleton } from "@/components/ui/skeleton";

const label = "Cara Pembayaran";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Kebijakan" }, { label: label }]}>
      <div className="flex flex-col gap-6 pt-4">
        <HeaderLoader title={label} withTitle={false} />
        <div className="w-full flex flex-col gap-1">
          <p className="text-xs font-medium">Judul</p>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
          </div>
        </div>
        <div className="flex flex-col w-full gap-2">
          <div className="flex items-center justify-between w-full">
            <Skeleton className="h-8 w-42.5" />
            <Skeleton className="h-8 w-23.5" />
          </div>
          <Skeleton className="w-full h-148.5" />
        </div>
        <div className="flex items-center gap-3 justify-end w-full">
          <Skeleton className="h-8 w-19.75" />
          <Skeleton className="h-8 w-19" />
        </div>
      </div>
    </MainContainer>
  );
};

export default Loading;
