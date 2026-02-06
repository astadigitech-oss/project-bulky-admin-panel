import { MainContainer } from "@/components/container/main-container";
import { HeaderLoader } from "@/components/loaders/header";
import { PaginationLoader } from "@/components/loaders/pagination";
import { TableLoader } from "@/components/loaders/table";

const label = "Force Update";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Pengaturan" }, { label: label }]}>
      <div className="flex flex-col gap-6 pt-4">
        <HeaderLoader title={label} />
        <TableLoader />
        <PaginationLoader />
      </div>
    </MainContainer>
  );
};

export default Loading;
