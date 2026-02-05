import { MainContainer } from "@/components/container/main-container";
import { HeaderLoader } from "@/components/loaders/header";
import { Skeleton } from "@/components/ui/skeleton";

const label = "Formulir Grosir";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Pemasaran" }, { label: label }]}>
      <div className="flex flex-col gap-6 pt-4">
        <HeaderLoader title={label} withTitle={false} />
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Skeleton className="w-full h-60.5" />
          <Skeleton className="w-full h-60.5" />
        </div>
      </div>
    </MainContainer>
  );
};

export default Loading;
