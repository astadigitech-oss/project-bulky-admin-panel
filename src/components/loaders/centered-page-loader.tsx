import { Spinner } from "@/components/ui/spinner";

export const CenteredPageLoader = ({
  label = "Memuat data...",
}: {
  label?: string;
}) => {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Spinner className="size-5" />
        <p>{label}</p>
      </div>
    </div>
  );
};
