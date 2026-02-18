import { MainContainer } from "@/components/container/main-container";
import { HeaderLoader } from "@/components/loaders/header";
import { PaginationLoader } from "@/components/loaders/pagination";
import { TableLoader } from "@/components/loaders/table";

const labelPage1 = "Tag";
const labelPage2 = "Berita";
const label = `${labelPage1} ${labelPage2}`;

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: labelPage2 }, { label: labelPage1 }]}>
      <div className="flex flex-col gap-6 pt-4">
        <HeaderLoader title={label} />
        <TableLoader />
        <PaginationLoader />
      </div>
    </MainContainer>
  );
};

export default Loading;
